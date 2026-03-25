import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchQuestions, createQuestion, updateQuestion, deleteQuestion, importQuestions, addQuestionsToChapter } from '../../../features/questions/questionSlice';
import { fetchSubjects } from '../../../features/subjects/subjectSlice';
import { Question, QuestionPayload } from '../../../types';
import questionBankService from '../../../services/questionBankService';
import { parseFileForPreview } from '../../../utils/filePreview';
import QuestionTable from './components/QuestionTable';
import QuestionForm from './components/QuestionForm';
import './QuestionList.css';

type ModalMode = 'create' | 'edit' | 'view' | 'delete';

const emptyForm: QuestionPayload = {
    SubjectID: '',
    BankID: '',
    ChapterNumber: '',
    Content: '',
    CorrectAnswer: '',
    Type: 'single',
    options: [],
};

function QuestionList() {
    const dispatch = useAppDispatch();
    const questions = useAppSelector((state) => state.questions.items);
    const subjects = useAppSelector((state) => state.subjects.items);
    const loading = useAppSelector((state) => state.questions.loading);
    const error = useAppSelector((state) => state.questions.error) || '';

    const [flash, setFlash] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState<string>('');
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [previewRows, setPreviewRows] = useState<string[][]>([]);
    const [previewLoading, setPreviewLoading] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('create');
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [formData, setFormData] = useState<QuestionPayload>(emptyForm);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [assignLoading, setAssignLoading] = useState(false);
    const [assignBanks, setAssignBanks] = useState<any[]>([]);
    const [assignChapters, setAssignChapters] = useState<any[]>([]);
    const [assignSelectedBank, setAssignSelectedBank] = useState<string>('');
    const [assignSelectedChapter, setAssignSelectedChapter] = useState<string>('');
    const [assignError, setAssignError] = useState('');

    const currentUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || 'null');
        } catch {
            return null;
        }
    }, []);

    const canEditGeneral = currentUser?.role === 0 || currentUser?.role === 1;

    const canEditRow = (q: Question) => {
        if (!currentUser) return false;
        if (currentUser.role === 0) return true; // Admin
        if (currentUser.role === 1 && q.UserID === currentUser.user_id) return true; // Teacher
        return false;
    };

    useEffect(() => {
        dispatch(fetchQuestions({ per_page: 100, search: searchTerm, type: searchType || undefined }));
    }, [dispatch, searchTerm, searchType]);

    useEffect(() => {
        dispatch(fetchSubjects());
    }, [dispatch]);

    const openModal = (mode: ModalMode, question: Question | null = null) => {
        setModalMode(mode);
        setSelectedQuestion(question);
        setSubmitError('');
        setFormErrors({});
        setFlash('');

        if (mode === 'create') {
            setFormData(emptyForm);
        } else if (question) {
            setFormData({
                SubjectID: question.SubjectID || '',
                BankID: question.BankID || '',
                ChapterNumber: question.ChapterNumber || '',
                Content: question.Content,
                CorrectAnswer: question.CorrectAnswer || '',
                Type: question.Type,
                options: question.options || [],
            });
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedQuestion(null);
        setSubmitError('');
        setFormErrors({});
    };

    const handleFormChange = (field: keyof QuestionPayload, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setFormErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleSubmit = async () => {
        setSubmitError('');

        if (!formData.SubjectID?.toString().trim()) {
            setFormErrors({ SubjectID: 'Vui lòng chọn môn học' });
            return;
        }
        if (!formData.Content.trim()) {
            setFormErrors({ Content: 'Vui lòng nhập nội dung câu hỏi' });
            return;
        }
        if ((formData.Type === 'single' || formData.Type === 'multiple') && (!formData.options || formData.options.length < 2)) {
            setSubmitError('Vui lòng thêm ít nhất 2 đáp án');
            return;
        }
        if (formData.Type === 'single' && formData.options?.filter(o => o.IsCorrect).length !== 1) {
             setSubmitError('Trắc nghiệm 1 đáp án phải có ĐÚNG 1 đáp án đúng');
             return;
        }

        try {
            if (modalMode === 'create') {
                await dispatch(createQuestion(formData)).unwrap();
                setFlash('Thêm câu hỏi thành công');
            } else if (modalMode === 'edit' && selectedQuestion) {
                await dispatch(updateQuestion({ id: selectedQuestion.QuestionID, payload: formData })).unwrap();
                setFlash('Cập nhật câu hỏi thành công');
            }
            closeModal();
            dispatch(fetchQuestions({ per_page: 100 }));
        } catch (err: any) {
            setSubmitError(typeof err === 'string' ? err : 'Có lỗi xảy ra, vui lòng thử lại.');
        }
    };

    const handleDelete = async (question: Question) => {
        setSubmitError('');
        setFlash('');
        try {
            await dispatch(deleteQuestion(question.QuestionID)).unwrap();
            setFlash('Xóa câu hỏi thành công');
            closeModal();
        } catch (err: any) {
            setSubmitError(typeof err === 'string' ? err : 'Không thể xóa câu hỏi này.');
        }
    };

    const handleOpenAssignModal = async () => {
        if (selectedIds.length === 0) return;
        setAssignError('');
        const selectedQuestions = questions.filter(q => selectedIds.includes(q.QuestionID));
        const subjectsInSelection = new Set(selectedQuestions.map(q => q.SubjectID));
        
        if (subjectsInSelection.size > 1) {
            setFlash('');
            setAssignError('Các câu hỏi được chọn phải cùng thuộc 1 môn học.');
            setAssignModalOpen(true);
            return;
        }

        const subjectId = Array.from(subjectsInSelection)[0];
        if (!subjectId) {
            setFlash('');
            setAssignError('Các câu hỏi được chọn không xác định môn học.');
            setAssignModalOpen(true);
            return;
        }

        setAssignLoading(true);
        setAssignModalOpen(true);
        try {
            const res = await questionBankService.getAll() as any;
            const fetchedBanks = Array.isArray(res) ? res : (res?.data?.data || res?.data || []);
            const filteredBanks = fetchedBanks.filter((b: any) => b.subject_id === subjectId);
            setAssignBanks(filteredBanks);
            setAssignSelectedBank('');
            setAssignChapters([]);
            setAssignSelectedChapter('');
        } catch (err) {
            setAssignError('Không thể tải danh sách ngân hàng.');
        } finally {
            setAssignLoading(false);
        }
    };

    const handleBankSelect = async (bankId: string) => {
        setAssignSelectedBank(bankId);
        setAssignSelectedChapter('');
        setAssignChapters([]);
        if (!bankId) return;
        setAssignLoading(true);
        try {
            const res = await questionBankService.getById(bankId) as any;
            const chapters = res?.data?.chapters || [];
            if (chapters.length === 0) {
                setAssignError('Ngân hàng chưa có chương nào. Hãy tạo chương trước.');
            } else {
                setAssignError('');
            }
            setAssignChapters(chapters);
        } catch (err) {
            setAssignError('Không thể tải danh sách chương của ngân hàng.');
        } finally {
            setAssignLoading(false);
        }
    };

    const handleAssignSubmit = async () => {
        if (!assignSelectedBank || !assignSelectedChapter) {
            setAssignError('Vui lòng chọn ngân hàng và chương.');
            return;
        }
        setAssignLoading(true);
        try {
            await dispatch(addQuestionsToChapter({
                bankId: assignSelectedBank,
                chapterId: parseInt(assignSelectedChapter, 10),
                questionIds: selectedIds
            })).unwrap();
            setFlash('Đã thêm các câu hỏi vào chương thành công.');
            setSelectedIds([]);
            setAssignModalOpen(false);
            dispatch(fetchQuestions({ per_page: 100, search: searchTerm, type: searchType || undefined }));
        } catch (err: any) {
            setAssignError(typeof err === 'string' ? err : 'Có lỗi xảy ra.');
        } finally {
            setAssignLoading(false);
        }
    };

    return (
        <div className="question-page">
            <div className="question-header">
                <div>
                    <h2>Quản lý câu hỏi</h2>
                    <p>Danh sách câu hỏi trong hệ thống</p>
                </div>
                {canEditGeneral && (
                    <div className="question-header-actions">
                        {selectedIds.length > 0 && (
                            <button
                                type="button"
                                className="primary-btn"
                                onClick={handleOpenAssignModal}
                            >
                                Thêm vào chương ({selectedIds.length})
                            </button>
                        )}
                        <button
                            type="button"
                            className="ghost-btn"
                            onClick={() => setUploadModalOpen(true)}
                        >
                            Import file
                        </button>
                        <button
                            type="button"
                            className="primary-btn"
                            onClick={() => openModal('create')}
                        >
                            Thêm câu hỏi
                        </button>
                    </div>
                )}
            </div>

            <div className="question-filters">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Tìm theo nội dung câu hỏi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="filter-select"
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                >
                    <option value="">Tất cả loại</option>
                    <option value="single">Trắc nghiệm 1 đáp án</option>
                    <option value="multiple">Trắc nghiệm nhiều đáp án</option>
                    <option value="essay">Tự luận</option>
                </select>
            </div>

            {flash && <div className="alert success">{flash}</div>}
            {error && <div className="alert error">{error}</div>}

            <QuestionTable
                questions={questions}
                loading={loading}
                canEdit={canEditRow}
                canDelete={canEditRow}
                onView={(q) => openModal('view', q)}
                onEdit={(q) => openModal('edit', q)}
                onDelete={(q) => openModal('delete', q)}
                selectedIds={canEditGeneral ? selectedIds : undefined}
                onSelectionChange={canEditGeneral ? setSelectedIds : undefined}
            />

            {modalOpen && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                {modalMode === 'create' && 'Thêm câu hỏi'}
                                {modalMode === 'edit' && 'Chỉnh sửa câu hỏi'}
                                {modalMode === 'view' && 'Chi tiết câu hỏi'}
                                {modalMode === 'delete' && 'Xóa câu hỏi'}
                            </h3>
                            <button type="button" className="icon-btn" onClick={closeModal}>
                                ×
                            </button>
                        </div>

                        {(modalMode === 'create' || modalMode === 'edit') && (
                            <QuestionForm
                                values={formData}
                                subjects={subjects}
                                errors={formErrors}
                                submitError={submitError}
                                mode={modalMode}
                                onChange={handleFormChange}
                                onSubmit={handleSubmit}
                                onCancel={closeModal}
                            />
                        )}

                        {modalMode === 'view' && selectedQuestion && (
                            <div className="modal-content">
                                <p>
                                    <strong>Môn học:</strong> {selectedQuestion.SubjectID
                                        ? (subjects.find(s => s.SubjectID === selectedQuestion.SubjectID)?.SubjectName || selectedQuestion.SubjectID)
                                        : '—'}
                                </p>
                                <p>
                                    <strong>Loại:</strong> {selectedQuestion.Type === 'single' ? 'Trắc nghiệm 1 đáp án' : selectedQuestion.Type === 'multiple' ? 'Trắc nghiệm nhiều đáp án' : 'Tự luận'}
                                </p>
                                <p>
                                    <strong>Nội dung:</strong> {selectedQuestion.Content}
                                </p>
                                {selectedQuestion.Type === 'essay' ? (
                                    <p>
                                        <strong>Đáp án mẫu:</strong> {selectedQuestion.CorrectAnswer || '-'}
                                    </p>
                                ) : (
                                    <div>
                                        <strong>Các đáp án:</strong>
                                        <ul>
                                            {selectedQuestion.options?.map((opt, i) => (
                                                <li key={i} style={{ color: opt.IsCorrect ? 'green' : 'inherit', fontWeight: opt.IsCorrect ? 'bold' : 'normal' }}>
                                                    {opt.Content} {opt.IsCorrect && '(Đúng)'}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <div className="modal-actions">
                                    <button type="button" className="primary-btn" onClick={closeModal}>
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        )}

                        {modalMode === 'delete' && selectedQuestion && (
                            <div className="modal-content">
                                <p>
                                    Bạn có chắc muốn xóa câu hỏi này?
                                </p>
                                {submitError && <div className="alert error">{submitError}</div>}
                                <div className="modal-actions">
                                    <button type="button" className="ghost-btn" onClick={closeModal}>
                                        Không
                                    </button>
                                    <button
                                        type="button"
                                        className="danger-btn"
                                        onClick={() => handleDelete(selectedQuestion)}
                                    >
                                        Có
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {assignModalOpen && (
                <div className="modal-backdrop" onClick={() => !assignLoading && setAssignModalOpen(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Thêm vào chương</h3>
                            <button type="button" className="icon-btn" onClick={() => !assignLoading && setAssignModalOpen(false)}>×</button>
                        </div>
                        <div className="modal-form">
                            <p>Đã chọn <strong>{selectedIds.length}</strong> câu hỏi.</p>
                            {assignError && <div className="alert error">{assignError}</div>}
                            
                            {!assignError || assignError.includes('Ngân hàng chưa có chương') ? (
                                <>
                                    <label>
                                        Chọn Ngân hàng
                                        <select
                                            value={assignSelectedBank}
                                            onChange={(e) => handleBankSelect(e.target.value)}
                                            disabled={assignLoading}
                                        >
                                            <option value="">-- Chọn ngân hàng --</option>
                                            {assignBanks.map((b) => (
                                                <option key={b.bank_id} value={b.bank_id}>
                                                    {b.bank_name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    
                                    <label>
                                        Chọn Chương
                                        <select
                                            value={assignSelectedChapter}
                                            onChange={(e) => setAssignSelectedChapter(e.target.value)}
                                            disabled={assignLoading || !assignSelectedBank || assignChapters.length === 0}
                                        >
                                            <option value="">-- Chọn chương --</option>
                                            {assignChapters.map((ch) => (
                                                <option key={ch.chapter_number} value={ch.chapter_number}>
                                                    Chương {ch.chapter_number}: {ch.chapter_name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </>
                            ) : null}

                            <div className="modal-actions">
                                <button type="button" className="ghost-btn" onClick={() => !assignLoading && setAssignModalOpen(false)}>Hủy</button>
                                <button
                                    type="button"
                                    className="primary-btn"
                                    disabled={assignLoading || !!assignError && !assignError.includes('Ngân hàng chưa có chương') || !assignSelectedBank || !assignSelectedChapter}
                                    onClick={handleAssignSubmit}
                                >
                                    {assignLoading ? 'Đang lưu...' : 'Lưu lại'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {uploadModalOpen && (
                <div className="modal-backdrop" onClick={() => { if (!uploading) { setUploadModalOpen(false); setPreviewRows([]); } }}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Import câu hỏi từ file CSV / XLSX</h3>
                            <button type="button" className="icon-btn" onClick={() => { if (!uploading) { setUploadModalOpen(false); setPreviewRows([]); } }}>×</button>
                        </div>
                        <div className="modal-content">
                            <p className="upload-help">
                                Hỗ trợ file <strong>CSV</strong> hoặc <strong>XLSX</strong>. Bắt buộc: cột <strong>nội dung</strong> (content/noidung) và <strong>loại</strong> (type/loại).<br />
                                <strong>Môn học</strong> (tùy chọn): cột <code>môn học</code> hoặc <code>subject</code> – nhập <strong>tên môn học</strong> đúng với danh sách môn học trong hệ thống.<br />
                                Đáp án: <code>option1</code>, <code>correct1</code>, <code>option2</code>, <code>correct2</code>... hoặc <code>đáp án 1</code>, <code>đúng 1</code>...<br />
                                Loại: <code>single</code>/trắc nghiệm 1 đáp án, <code>multiple</code>/nhiều đáp án, <code>essay</code>/tự luận.
                            </p>
                            <input
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={async (e) => {
                                    const f = e.target.files?.[0];
                                    setUploadFile(f || null);
                                    setUploadError('');
                                    setPreviewRows([]);
                                    if (!f) return;
                                    setPreviewLoading(true);
                                    try {
                                        const rows = await parseFileForPreview(f);
                                        setPreviewRows(rows.slice(0, 15));
                                    } catch {
                                        setUploadError('Không thể đọc file để xem trước');
                                        setPreviewRows([]);
                                    } finally {
                                        setPreviewLoading(false);
                                    }
                                }}
                            />
                            {previewLoading && <p className="upload-preview-loading">Đang đọc file...</p>}
                            {previewRows.length > 0 && (
                                <div className="upload-preview">
                                    <strong>Xem trước (tối đa 15 dòng đầu):</strong>
                                    <div className="upload-preview-table-wrap">
                                        <table className="upload-preview-table">
                                            <thead>
                                                <tr>
                                                    {previewRows[0]?.map((h, i) => (
                                                        <th key={i}>{h || `Cột ${i + 1}`}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {previewRows.slice(1).map((row, ri) => (
                                                    <tr key={ri}>
                                                        {row.map((cell, ci) => (
                                                            <td key={ci} title={String(cell)}>
                                                                {String(cell).length > 40 ? String(cell).slice(0, 40) + '...' : cell}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                            {uploadError && <div className="alert error">{uploadError}</div>}
                            <div className="modal-actions">
                                <button type="button" className="ghost-btn" onClick={() => { if (!uploading) { setUploadModalOpen(false); setPreviewRows([]); } }}>Hủy</button>
                                <button
                                    type="button"
                                    className="primary-btn"
                                    disabled={!uploadFile || uploading}
                                    onClick={async () => {
                                        if (!uploadFile) return;
                                        setUploading(true);
                                        setUploadError('');
                                        try {
                                            const result = await dispatch(importQuestions(uploadFile)).unwrap();
                                            const hasErrors = result?.errors?.length;
                                            setFlash(hasErrors && result.imported === 0
                                                ? (result.errors?.slice(0, 3).join(' ') || 'Import thất bại')
                                                : `Đã import ${result?.imported ?? 0} câu hỏi` + (hasErrors ? '. Một số dòng có lỗi.' : ''));
                                            setUploadModalOpen(false);
                                            setUploadFile(null);
                                            setPreviewRows([]);
                                            dispatch(fetchQuestions({ per_page: 100, search: searchTerm, type: searchType || undefined }));
                                        } catch (err: any) {
                                            setUploadError(typeof err === 'string' ? err : (err?.message || 'Import thất bại'));
                                        } finally {
                                            setUploading(false);
                                        }
                                    }}
                                >
                                    {uploading ? 'Đang import...' : 'Import'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default QuestionList;
