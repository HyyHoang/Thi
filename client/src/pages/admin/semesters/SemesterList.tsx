import React, { useEffect, useMemo, useState } from 'react';
import semesterService from '../../../services/semesterService';
import { Semester, SemesterPayload } from '../../../types';
import SemesterForm from './components/SemesterForm';
import SemesterTable from './components/SemesterTable';
import './SemesterList.css';

type ModalMode = 'create' | 'edit' | 'view' | 'delete';

const emptyForm: SemesterPayload = {
    semester_name: '',
    academic_year: '',
    start_date: '',
    end_date: '',
};

function SemesterList() {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [flash, setFlash] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('create');
    const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
    const [formData, setFormData] = useState<SemesterPayload>(emptyForm);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');

    const canEdit = useMemo(() => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            return user?.role === 0;
        } catch {
            return false;
        }
    }, []);

    const loadSemesters = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await semesterService.getAll();
            setSemesters(response.data || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Không thể tải danh sách học kỳ.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSemesters();
    }, []);

    const openModal = (mode: ModalMode, semester: Semester | null = null) => {
        setModalMode(mode);
        setSelectedSemester(semester);
        setSubmitError('');
        setFormErrors({});
        setFlash('');

        if (mode === 'create') {
            setFormData(emptyForm);
        } else if (semester) {
            setFormData({
                semester_name: semester.semester_name || '',
                academic_year: semester.academic_year || '',
                start_date: semester.start_date || '',
                end_date: semester.end_date || '',
            });
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedSemester(null);
        setSubmitError('');
        setFormErrors({});
    };

    const handleFormChange = (field: keyof SemesterPayload, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setFormErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleSubmit = async () => {
        setSubmitError('');

        try {
            if (modalMode === 'create') {
                await semesterService.create(formData);
                setFlash('Tạo học kỳ thành công');
            } else if (modalMode === 'edit' && selectedSemester) {
                await semesterService.update(selectedSemester.semester_id, formData);
                setFlash('Cập nhật học kỳ thành công');
            }

            closeModal();
            loadSemesters();
        } catch (err: any) {
            const apiErrors = err.response?.data?.errors || {};
            if (Object.keys(apiErrors).length > 0) {
                const mapped: Record<string, string> = {};
                Object.keys(apiErrors).forEach((key) => {
                    mapped[key] = apiErrors[key]?.[0] || '';
                });
                setFormErrors(mapped);
            }
            setSubmitError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        }
    };

    const handleDelete = async (semester: Semester) => {
        setSubmitError('');
        setFlash('');
        try {
            await semesterService.remove(semester.semester_id);
            setFlash('Xóa học kỳ thành công');
            closeModal();
            loadSemesters();
        } catch (err: any) {
            setSubmitError(err.response?.data?.message || 'Không thể xóa học kỳ.');
        }
    };

    return (
        <div className="semester-page">
            <div className="semester-header">
                <div>
                    <h2>Quản lý học kỳ</h2>
                    <p>Danh sách học kỳ trong hệ thống</p>
                </div>
                {canEdit && (
                    <button type="button" className="primary-btn" onClick={() => openModal('create')}>
                        Thêm học kỳ
                    </button>
                )}
            </div>

            {flash && <div className="alert success">{flash}</div>}
            {error && <div className="alert error">{error}</div>}

            <SemesterTable
                semesters={semesters}
                loading={loading}
                canEdit={canEdit}
                onView={(semester) => openModal('view', semester)}
                onEdit={(semester) => openModal('edit', semester)}
                onDelete={(semester) => openModal('delete', semester)}
            />

            {modalOpen && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                {modalMode === 'create' && 'Thêm học kỳ'}
                                {modalMode === 'edit' && 'Chỉnh sửa học kỳ'}
                                {modalMode === 'view' && 'Thông tin học kỳ'}
                                {modalMode === 'delete' && 'Xóa học kỳ'}
                            </h3>
                            <button type="button" className="icon-btn" onClick={closeModal}>
                                ×
                            </button>
                        </div>

                        {(modalMode === 'create' || modalMode === 'edit') && (
                            <SemesterForm
                                values={formData}
                                errors={formErrors}
                                submitError={submitError}
                                mode={modalMode}
                                onChange={handleFormChange}
                                onSubmit={handleSubmit}
                                onCancel={closeModal}
                            />
                        )}

                        {modalMode === 'view' && selectedSemester && (
                            <div className="modal-content">
                                <p>
                                    <strong>Tên học kỳ:</strong> {selectedSemester.semester_name}
                                </p>
                                <p>
                                    <strong>Năm học:</strong> {selectedSemester.academic_year}
                                </p>
                                <p>
                                    <strong>Ngày bắt đầu:</strong> {selectedSemester.start_date}
                                </p>
                                <p>
                                    <strong>Ngày kết thúc:</strong> {selectedSemester.end_date}
                                </p>
                                <div className="modal-actions">
                                    <button type="button" className="primary-btn" onClick={closeModal}>
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        )}

                        {modalMode === 'delete' && selectedSemester && (
                            <div className="modal-content">
                                <p>
                                    Bạn có chắc muốn xóa học kỳ <strong>{selectedSemester.semester_name}</strong>?
                                </p>
                                {submitError && <div className="alert error">{submitError}</div>}
                                <div className="modal-actions">
                                    <button type="button" className="ghost-btn" onClick={closeModal}>
                                        Không
                                    </button>
                                    <button type="button" className="danger-btn" onClick={() => handleDelete(selectedSemester)}>
                                        Có
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SemesterList;
