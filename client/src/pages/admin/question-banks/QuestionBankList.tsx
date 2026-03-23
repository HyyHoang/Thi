import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchQuestionBanks } from '../../../features/questionBanks/questionBankSlice';
import {
    selectQuestionBanks,
    selectQuestionBanksError,
    selectQuestionBanksLoading,
} from '../../../features/questionBanks/selectors';
import subjectService from '../../../services/subjectService';
import questionBankService from '../../../services/questionBankService';
import {
    QuestionBank,
    QuestionBankCreatePayload,
    QuestionBankPayload,
    QuestionBankDetail,
    QuestionChapterRow,
    Subject,
} from '../../../types';
import QuestionBankTable from './components/QuestionBankTable';
import QuestionBankForm from './components/QuestionBankForm';
import '../departments/DepartmentList.css';
import './QuestionBankList.css';

type ModalMode = 'create' | 'edit' | 'view' | 'delete';

const emptyForm: QuestionBankPayload & { subject_id: number | string } = {
    bank_name: '',
    subject_id: '',
    description: '',
};

const emptyChapter = {
    chapter_number: '',
    chapter_name: '',
    description: '',
};

function QuestionBankList() {
    const dispatch = useAppDispatch();
    const banks = useAppSelector(selectQuestionBanks);
    const loading = useAppSelector(selectQuestionBanksLoading);
    const error = useAppSelector(selectQuestionBanksError) || '';

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [flash, setFlash] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('create');
    const [selectedBank, setSelectedBank] = useState<QuestionBank | null>(null);
    const [formData, setFormData] =
        useState<QuestionBankPayload & { subject_id: number | string }>(emptyForm);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');
    const [chapterNames, setChapterNames] = useState<string[]>(['']);

    const [detail, setDetail] = useState<QuestionBankDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const [chapterModalOpen, setChapterModalOpen] = useState(false);
    const [chapterMode, setChapterMode] = useState<'create' | 'edit'>('create');
    const [chapterForm, setChapterForm] = useState(emptyChapter);
    const [chapterEditId, setChapterEditId] = useState<number | null>(null);
    const [chapterSubmitError, setChapterSubmitError] = useState('');

    const currentUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || 'null');
        } catch {
            return null;
        }
    }, []);

    const canAdd = useMemo(() => {
        const r = currentUser?.role;
        return r === 0 || r === 1;
    }, [currentUser]);

    const canModifyBank = useCallback(
        (bank: QuestionBank) => {
            if (!currentUser) return false;
            if (currentUser.role === 0) return true;
            if (currentUser.role === 1 && bank.user_id === currentUser.user_id) return true;
            return false;
        },
        [currentUser]
    );

    const loadSubjects = async () => {
        try {
            const response = await subjectService.getAll();
            const raw = response as unknown as Subject[] | { data: Subject[] };
            setSubjects(Array.isArray(raw) ? raw : raw.data || []);
        } catch {
            setSubjects([]);
        }
    };

    useEffect(() => {
        dispatch(fetchQuestionBanks());
        loadSubjects();
    }, [dispatch]);

    const loadDetail = async (bankId: string) => {
        setDetailLoading(true);
        setDetail(null);
        try {
            const res = (await questionBankService.getById(bankId)) as {
                success?: boolean;
                data: QuestionBankDetail;
            };
            setDetail(res.data);
        } catch {
            setDetail(null);
        } finally {
            setDetailLoading(false);
        }
    };

    const openModal = (mode: ModalMode, bank: QuestionBank | null = null) => {
        setModalMode(mode);
        setSelectedBank(bank);
        setSubmitError('');
        setFormErrors({});
        setFlash('');

        if (mode === 'create') {
            setFormData(emptyForm);
            setChapterNames(['']);
            setDetail(null);
        } else if (bank) {
            setFormData({
                bank_name: bank.bank_name || '',
                subject_id: bank.subject_id ? String(bank.subject_id) : '',
                description: bank.description || '',
            });
            if (mode === 'view') {
                loadDetail(bank.bank_id);
            } else {
                setDetail(null);
            }
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedBank(null);
        setSubmitError('');
        setFormErrors({});
        setDetail(null);
    };

    const handleFormChange = (field: keyof QuestionBankPayload, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setFormErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleCreateChapterCountChange = (count: number) => {
        const safe = Math.max(1, Math.min(100, count));
        setChapterNames((prev) => {
            if (safe === prev.length) return prev;
            if (safe > prev.length) {
                return [...prev, ...Array(safe - prev.length).fill('')];
            }
            return prev.slice(0, safe);
        });
        setFormErrors((prev) => ({ ...prev, chapters: '' }));
    };

    const handleCreateChapterNameChange = (index: number, value: string) => {
        setChapterNames((prev) => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
        setFormErrors((prev) => ({ ...prev, chapters: '' }));
    };

    const handleSubmit = async () => {
        setSubmitError('');

        const payload: QuestionBankPayload = {
            bank_name: formData.bank_name,
            subject_id: formData.subject_id ? String(formData.subject_id) : formData.subject_id,
            description: formData.description,
        };

        try {
            if (modalMode === 'create') {
                const chapters = chapterNames.map((name, i) => ({
                    chapter_number: i + 1,
                    chapter_name: name.trim(),
                }));
                if (chapters.some((c) => !c.chapter_name)) {
                    setSubmitError('Vui lòng nhập tên cho tất cả các chương.');
                    return;
                }
                const createPayload: QuestionBankCreatePayload = {
                    ...payload,
                    chapters,
                };
                await questionBankService.create(createPayload);
                setFlash('Tạo ngân hàng thành công');
            } else if (modalMode === 'edit' && selectedBank) {
                await questionBankService.update(selectedBank.bank_id, payload);
                setFlash('Cập nhật thành công');
            }
            closeModal();
            dispatch(fetchQuestionBanks());
        } catch (err: any) {
            const apiErrors = err.response?.data?.errors || {};
            if (Object.keys(apiErrors).length > 0) {
                const mapped: Record<string, string> = {};
                Object.keys(apiErrors).forEach((key) => {
                    mapped[key] = apiErrors[key]?.[0] || '';
                });
                const chapterMsg = Object.keys(mapped).find((k) => k.startsWith('chapters'));
                if (chapterMsg) {
                    mapped.chapters = mapped[chapterMsg] || 'Vui lòng kiểm tra lại danh sách chương.';
                }
                setFormErrors(mapped);
            }
            setSubmitError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        }
    };

    const handleDelete = async (bank: QuestionBank) => {
        setSubmitError('');
        setFlash('');
        try {
            await questionBankService.remove(bank.bank_id);
            setFlash('Xóa thành công');
            closeModal();
            dispatch(fetchQuestionBanks());
        } catch (err: any) {
            setSubmitError(err.response?.data?.message || 'Không thể xóa ngân hàng.');
        }
    };

    const openChapterModal = (mode: 'create' | 'edit', chapter?: QuestionChapterRow) => {
        setChapterSubmitError('');
        setChapterMode(mode);
        if (mode === 'create') {
            setChapterForm(emptyChapter);
            setChapterEditId(null);
        } else if (chapter) {
            setChapterForm({
                chapter_number: String(chapter.chapter_number),
                chapter_name: chapter.chapter_name,
                description: chapter.description || '',
            });
            setChapterEditId(chapter.chapter_id);
        }
        setChapterModalOpen(true);
    };

    const closeChapterModal = () => {
        setChapterModalOpen(false);
        setChapterSubmitError('');
    };

    const submitChapter = async () => {
        if (!selectedBank) return;
        setChapterSubmitError('');
        const num = parseInt(String(chapterForm.chapter_number), 10);
        if (!num || num < 1) {
            setChapterSubmitError('Vui lòng nhập số chương hợp lệ.');
            return;
        }
        if (!chapterForm.chapter_name.trim()) {
            setChapterSubmitError('Vui lòng nhập tên chương.');
            return;
        }

        try {
            if (chapterMode === 'create') {
                await questionBankService.createChapter(selectedBank.bank_id, {
                    chapter_number: num,
                    chapter_name: chapterForm.chapter_name.trim(),
                    description: chapterForm.description || undefined,
                });
            } else if (chapterEditId != null) {
                await questionBankService.updateChapter(selectedBank.bank_id, chapterEditId, {
                    chapter_number: num,
                    chapter_name: chapterForm.chapter_name.trim(),
                    description: chapterForm.description || undefined,
                });
            }
            closeChapterModal();
            await loadDetail(selectedBank.bank_id);
            dispatch(fetchQuestionBanks());
            setFlash(chapterMode === 'create' ? 'Thêm chương thành công' : 'Cập nhật chương thành công');
        } catch (err: any) {
            setChapterSubmitError(err.response?.data?.message || 'Không thể lưu chương.');
        }
    };

    const handleDeleteChapter = async (ch: QuestionChapterRow) => {
        if (!selectedBank) return;
        if (ch.question_count > 0) {
            setFlash('');
            setSubmitError('Không thể xóa chương đã có câu hỏi.');
            return;
        }
        if (!window.confirm(`Xóa chương "${ch.chapter_name}"?`)) return;
        try {
            await questionBankService.removeChapter(selectedBank.bank_id, ch.chapter_id);
            await loadDetail(selectedBank.bank_id);
            dispatch(fetchQuestionBanks());
            setFlash('Xóa chương thành công');
        } catch (err: any) {
            setSubmitError(err.response?.data?.message || 'Không thể xóa chương.');
        }
    };

    const subjectNameForDetail = (subjectId: string) => {
        const found = subjects.find((s) => s.SubjectID === subjectId);
        return found?.SubjectName || detail?.bank.subject_name || '-';
    };

    return (
        <div className="department-page">
            <div className="department-header">
                <div>
                    <h2>Quản lý ngân hàng câu hỏi</h2>
                    <p>Danh sách ngân hàng trong hệ thống</p>
                </div>
                {canAdd && (
                    <button type="button" className="primary-btn" onClick={() => openModal('create')}>
                        Thêm ngân hàng
                    </button>
                )}
            </div>

            {flash && <div className="alert success">{flash}</div>}
            {error && <div className="alert error">{error}</div>}

            <QuestionBankTable
                banks={banks}
                subjects={subjects}
                loading={loading}
                canModifyBank={canModifyBank}
                onView={(b) => openModal('view', b)}
                onEdit={(b) => openModal('edit', b)}
                onDelete={(b) => openModal('delete', b)}
            />

            {modalOpen && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div
                        className={`modal ${modalMode === 'view' ? 'modal-wide' : ''}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3>
                                {modalMode === 'create' && 'Thêm ngân hàng'}
                                {modalMode === 'edit' && 'Chỉnh sửa ngân hàng'}
                                {modalMode === 'view' && 'Chi tiết ngân hàng'}
                                {modalMode === 'delete' && 'Xóa ngân hàng'}
                            </h3>
                            <button type="button" className="icon-btn" onClick={closeModal}>
                                ×
                            </button>
                        </div>

                        {(modalMode === 'create' || modalMode === 'edit') && (
                            <QuestionBankForm
                                values={formData}
                                subjects={subjects}
                                errors={formErrors}
                                submitError={submitError}
                                mode={modalMode}
                                onChange={handleFormChange}
                                onSubmit={handleSubmit}
                                onCancel={closeModal}
                                chapterNames={
                                    modalMode === 'create' ? chapterNames : undefined
                                }
                                onChapterCountChange={
                                    modalMode === 'create'
                                        ? handleCreateChapterCountChange
                                        : undefined
                                }
                                onChapterNameChange={
                                    modalMode === 'create'
                                        ? handleCreateChapterNameChange
                                        : undefined
                                }
                            />
                        )}

                        {modalMode === 'view' && selectedBank && (
                            <div className="modal-content">
                                {detailLoading && <p className="muted">Đang tải chi tiết...</p>}
                                {!detailLoading && detail && (
                                    <>
                                        <p>
                                            <strong>Tên ngân hàng:</strong> {detail.bank.bank_name}
                                        </p>
                                        <p>
                                            <strong>Môn học:</strong>{' '}
                                            {subjectNameForDetail(detail.bank.subject_id)}
                                        </p>
                                        <p>
                                            <strong>Mô tả:</strong> {detail.bank.description || '-'}
                                        </p>
                                        <p>
                                            <strong>Tổng số câu hỏi:</strong> {detail.total_questions}
                                        </p>
                                        <div className="qb-chapter-head">
                                            <strong>Danh sách chương</strong>
                                            {canModifyBank(detail.bank) && (
                                                <button
                                                    type="button"
                                                    className="primary-btn qb-small-btn"
                                                    onClick={() => openChapterModal('create')}
                                                >
                                                    Thêm chương
                                                </button>
                                            )}
                                        </div>
                                        <div className="department-table-wrapper qb-inner-table">
                                            <table className="department-table">
                                                <thead>
                                                    <tr>
                                                        <th>Số chương</th>
                                                        <th>Tên chương</th>
                                                        <th>Số câu hỏi</th>
                                                        <th>Thao tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {detail.chapters.length === 0 && (
                                                        <tr>
                                                            <td colSpan={4} className="muted">
                                                                Chưa có chương nào.
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {detail.chapters.map((ch) => (
                                                        <tr key={ch.chapter_id}>
                                                            <td>{ch.chapter_number}</td>
                                                            <td>{ch.chapter_name}</td>
                                                            <td>{ch.question_count}</td>
                                                            <td>
                                                                {canModifyBank(detail.bank) && (
                                                                    <div className="action-group">
                                                                        <button
                                                                            type="button"
                                                                            className="ghost-btn"
                                                                            onClick={() =>
                                                                                openChapterModal('edit', ch)
                                                                            }
                                                                        >
                                                                            Sửa
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="danger-btn"
                                                                            onClick={() =>
                                                                                handleDeleteChapter(ch)
                                                                            }
                                                                            disabled={ch.question_count > 0}
                                                                        >
                                                                            Xóa
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                                {!detailLoading && !detail && (
                                    <p className="alert error">Không tải được chi tiết.</p>
                                )}
                                {submitError && modalMode === 'view' && (
                                    <div className="alert error">{submitError}</div>
                                )}
                                <div className="modal-actions">
                                    <button type="button" className="primary-btn" onClick={closeModal}>
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        )}

                        {modalMode === 'delete' && selectedBank && (
                            <div className="modal-content">
                                <p>
                                    Bạn có chắc muốn xóa ngân hàng{' '}
                                    <strong>{selectedBank.bank_name}</strong>?
                                </p>
                                {submitError && <div className="alert error">{submitError}</div>}
                                <div className="modal-actions">
                                    <button type="button" className="ghost-btn" onClick={closeModal}>
                                        Không
                                    </button>
                                    <button
                                        type="button"
                                        className="danger-btn"
                                        onClick={() => handleDelete(selectedBank)}
                                    >
                                        Có
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {chapterModalOpen && selectedBank && (
                <div className="modal-backdrop" onClick={closeChapterModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{chapterMode === 'create' ? 'Thêm chương' : 'Sửa chương'}</h3>
                            <button type="button" className="icon-btn" onClick={closeChapterModal}>
                                ×
                            </button>
                        </div>
                        <div className="modal-form">
                            {chapterSubmitError && (
                                <div className="alert error">{chapterSubmitError}</div>
                            )}
                            <label>
                                Số chương
                                <input
                                    type="number"
                                    min={1}
                                    value={chapterForm.chapter_number}
                                    onChange={(e) =>
                                        setChapterForm((p) => ({
                                            ...p,
                                            chapter_number: e.target.value,
                                        }))
                                    }
                                />
                            </label>
                            <label>
                                Tên chương
                                <input
                                    type="text"
                                    value={chapterForm.chapter_name}
                                    onChange={(e) =>
                                        setChapterForm((p) => ({ ...p, chapter_name: e.target.value }))
                                    }
                                />
                            </label>
                            <label>
                                Mô tả
                                <textarea
                                    rows={3}
                                    value={chapterForm.description}
                                    onChange={(e) =>
                                        setChapterForm((p) => ({ ...p, description: e.target.value }))
                                    }
                                />
                            </label>
                            <div className="modal-actions">
                                <button type="button" className="ghost-btn" onClick={closeChapterModal}>
                                    Hủy
                                </button>
                                <button type="button" className="primary-btn" onClick={submitChapter}>
                                    Lưu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default QuestionBankList;
