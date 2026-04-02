import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../lib/store/redux/hooks';
import { fetchExams, createExam, updateExam, deleteExam } from '../redux/examThunks';
import { selectExams, selectExamsError } from '../redux/examSelectors';
import { Exam, ExamPayload } from '../../../types';
import ExamTable from '../components/ExamTable';
import ExamForm from '../components/ExamForm';
import { CrudLayout } from '../../../components/layout/CrudLayout';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { MdAdd, MdWarningAmber } from 'react-icons/md';
import examService from '../../../services/examService';

type ModalMode = 'create' | 'edit' | 'view' | 'delete';

function ExamList() {
    const dispatch = useAppDispatch();
    const exams = useAppSelector(selectExams);
    const error = useAppSelector(selectExamsError) || '';

    const [flash, setFlash] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('create');
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [detailExam, setDetailExam] = useState<Exam | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const currentUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || 'null');
        } catch {
            return null;
        }
    }, []);

    useEffect(() => {
        dispatch(fetchExams());
    }, [dispatch]);

    const openModal = async (mode: ModalMode, exam: Exam | null = null) => {
        setModalMode(mode);
        setSelectedExam(exam);
        setSubmitError('');
        setFlash('');
        setDetailExam(null);

        if ((mode === 'edit' || mode === 'view') && exam) {
            setDetailLoading(true);
            try {
                const res: any = await examService.getById(exam.exam_id);
                setDetailExam(res?.data || res);
            } catch {
                setDetailExam(exam);
            } finally {
                setDetailLoading(false);
            }
        }

        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedExam(null);
        setDetailExam(null);
        setSubmitError('');
    };

    const handleFormSubmit = async (payload: ExamPayload) => {
        setSubmitting(true);
        setSubmitError('');
        try {
            if (modalMode === 'create') {
                await dispatch(createExam(payload)).unwrap();
                setFlash('Tạo đề thi thành công!');
            } else if (modalMode === 'edit' && selectedExam) {
                await dispatch(updateExam({ id: selectedExam.exam_id, payload })).unwrap();
                setFlash('Cập nhật đề thi thành công!');
            }
            closeModal();
            dispatch(fetchExams());
        } catch (err: any) {
            setSubmitError(typeof err === 'string' ? err : err?.message || 'Có lỗi xảy ra.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedExam) return;
        setSubmitting(true);
        setSubmitError('');
        try {
            await dispatch(deleteExam(selectedExam.exam_id)).unwrap();
            setFlash('Xóa đề thi thành công!');
            closeModal();
            dispatch(fetchExams());
        } catch (err: any) {
            setSubmitError(typeof err === 'string' ? err : err?.message || 'Không thể xóa đề thi.');
        } finally {
            setSubmitting(false);
        }
    };

    const canAddExam = currentUser?.role === 0 || currentUser?.role === 1;
    const currentUserId = currentUser?.user_id || '';
    const currentUserRole = currentUser?.role ?? -1;

    function formatDateTime(dt: string) {
        if (!dt) return '—';
        return new Date(dt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
    }

    return (
        <CrudLayout
            title="Quản lý đề thi"
            description="Danh sách đề thi trong hệ thống"
            flash={flash}
            error={error}
            action={
                canAddExam && (
                    <Button variant="primary" onClick={() => openModal('create')}>
                        <MdAdd size={18} style={{ marginRight: 4 }} />
                        Tạo đề thi
                    </Button>
                )
            }
        >
            <ExamTable
                exams={exams}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                onView={(e) => openModal('view', e)}
                onEdit={(e) => openModal('edit', e)}
                onDelete={(e) => openModal('delete', e)}
            />

            {/* Create / Edit Modal */}
            <Modal
                isOpen={modalOpen && (modalMode === 'create' || modalMode === 'edit')}
                onClose={closeModal}
                size="xl"
                title={modalMode === 'create' ? '✏️ Tạo đề thi mới' : '📝 Chỉnh sửa đề thi'}
            >
                {(modalMode === 'create' || (modalMode === 'edit' && !detailLoading)) && (
                    <>
                        {submitError && (
                            <div className="alert error" style={{ marginBottom: '1rem' }}>
                                <MdWarningAmber size={18} /> {submitError}
                            </div>
                        )}
                        <ExamForm
                            exam={modalMode === 'edit' ? (detailExam || selectedExam) : null}
                            onSubmit={handleFormSubmit}
                            onCancel={closeModal}
                            submitting={submitting}
                        />
                    </>
                )}
                {modalMode === 'edit' && detailLoading && (
                    <p className="muted">Đang tải thông tin đề thi...</p>
                )}
            </Modal>

            {/* View Modal */}
            <Modal
                isOpen={modalOpen && modalMode === 'view'}
                onClose={closeModal}
                size="lg"
                title="📋 Chi tiết đề thi"
            >
                {detailLoading && <p className="muted">Đang tải...</p>}
                {!detailLoading && (detailExam || selectedExam) && (() => {
                    const exam = detailExam || selectedExam!;
                    return (
                        <div>
                            <table className="review-table">
                                <tbody>
                                    <tr><td>Mã đề thi</td><td><strong>{exam.exam_id}</strong></td></tr>
                                    <tr><td>Tiêu đề</td><td><strong>{exam.title}</strong></td></tr>
                                    <tr><td>Học kỳ</td><td>{exam.semester_name || '—'}</td></tr>
                                    <tr><td>Môn học</td><td>{exam.subject_name || '—'}</td></tr>
                                    <tr><td>Lớp học phần</td><td>{exam.section_name || exam.section_id}</td></tr>
                                    <tr><td>Thời gian bắt đầu</td><td>{formatDateTime(exam.start_time)}</td></tr>
                                    <tr><td>Thời gian kết thúc</td><td>{formatDateTime(exam.end_time)}</td></tr>
                                    <tr><td>Thời gian làm bài</td><td>{exam.duration} phút</td></tr>
                                    <tr><td>Tổng số câu</td><td><span className="badge badge-primary">{exam.question_count} câu</span></td></tr>
                                    <tr><td>Mật khẩu</td><td>{exam.password_enabled ? <span className="badge badge-warning">Có bảo vệ</span> : 'Không'}</td></tr>
                                    <tr><td>Người tạo</td><td>{exam.creator_username || exam.created_by}</td></tr>
                                    <tr><td>Ngày tạo</td><td>{exam.created_date ? formatDateTime(exam.created_date) : '—'}</td></tr>
                                </tbody>
                            </table>

                            {exam.chapter_configs && exam.chapter_configs.length > 0 && (
                                <>
                                    <h4 style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                                        Cấu hình câu hỏi theo chương
                                    </h4>
                                    <table className="crud-table" style={{ fontSize: '0.9rem' }}>
                                        <thead>
                                            <tr>
                                                <th>Ngân hàng</th>
                                                <th>Chương</th>
                                                <th>Số câu lấy</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {exam.chapter_configs.map((cfg, idx) => (
                                                <tr key={idx}>
                                                    <td>{cfg.bank_name || cfg.bank_id}</td>
                                                    <td>Chương {cfg.chapter_number}</td>
                                                    <td><span className="badge badge-primary">{cfg.question_count}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            )}

                            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="primary" onClick={closeModal}>Đóng</Button>
                            </div>
                        </div>
                    );
                })()}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={modalOpen && modalMode === 'delete'}
                onClose={closeModal}
                title="🗑️ Xóa đề thi"
            >
                <div>
                    <p>
                        Bạn có chắc muốn xóa đề thi{' '}
                        <strong>"{selectedExam?.title}"</strong>?
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Hành động này không thể hoàn tác.
                    </p>
                    {submitError && (
                        <div className="alert error">
                            <MdWarningAmber size={18} /> {submitError}
                        </div>
                    )}
                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <Button variant="ghost" onClick={closeModal} disabled={submitting}>Hủy</Button>
                        <Button variant="danger" onClick={handleDelete} disabled={submitting}>
                            {submitting ? 'Đang xóa...' : 'Xác nhận xóa'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </CrudLayout>
    );
}

export default ExamList;
