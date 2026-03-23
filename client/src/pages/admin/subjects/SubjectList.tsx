import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchSubjects, createSubject, updateSubject, deleteSubject } from '../../../features/subjects/subjectSlice';
import departmentService from '../../../services/departmentService';
import { Subject, SubjectPayload, Department } from '../../../types';
import SubjectTable from './components/SubjectTable';
import SubjectForm from './components/SubjectForm';
import './SubjectList.css';

type ModalMode = 'create' | 'edit' | 'view' | 'delete';

const emptyForm: SubjectPayload & { DepartmentID: number | string } = {
  SubjectName: '',
  DepartmentID: '',
  Description: '',
  Credit: 2,
};

function SubjectList() {
  const dispatch = useAppDispatch();
  const subjects = useAppSelector(state => state.subjects.items);
  const loading = useAppSelector(state => state.subjects.loading);
  const error = useAppSelector(state => state.subjects.error) || '';

  const [departments, setDepartments] = useState<Department[]>([]);
  const [flash, setFlash] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<SubjectPayload & { DepartmentID: number | string }>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const canEdit = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      return user?.role === 0; // Only admin
    } catch {
      return false;
    }
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await departmentService.getAll();
      setDepartments((response as any).data || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    dispatch(fetchSubjects());
    loadDepartments();
  }, [dispatch]);

  const openModal = (mode: ModalMode, subject: Subject | null = null) => {
    setModalMode(mode);
    setSelectedSubject(subject);
    setSubmitError('');
    setFormErrors({});
    setFlash('');

    if (mode === 'create') {
      setFormData(emptyForm);
    } else if (subject) {
      setFormData({
        SubjectName: subject.SubjectName || '',
        DepartmentID: subject.DepartmentID ? String(subject.DepartmentID) : '',
        Description: subject.Description || '',
        Credit: subject.Credit || 2,
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedSubject(null);
    setSubmitError('');
    setFormErrors({});
  };

  const handleFormChange = (field: keyof SubjectPayload, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async () => {
    setSubmitError('');

    const payload: SubjectPayload = {
      SubjectName: formData.SubjectName,
      DepartmentID: formData.DepartmentID ? String(formData.DepartmentID) : formData.DepartmentID,
      Description: formData.Description,
      Credit: formData.Credit ? Number(formData.Credit) : 0,
    };

    try {
      if (modalMode === 'create') {
        await dispatch(createSubject(payload)).unwrap();
        setFlash('Thêm môn học thành công');
      } else if (modalMode === 'edit' && selectedSubject) {
        await dispatch(updateSubject({ id: selectedSubject.SubjectID, payload })).unwrap();
        setFlash('Cập nhật môn học thành công');
      }
      closeModal();
      dispatch(fetchSubjects());
    } catch (err: any) {
      setSubmitError(typeof err === 'string' ? err : 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const handleDelete = async (subject: Subject) => {
    setSubmitError('');
    setFlash('');
    try {
      await dispatch(deleteSubject(subject.SubjectID)).unwrap();
      setFlash('Xóa môn học thành công');
      closeModal();
      dispatch(fetchSubjects());
    } catch (err: any) {
      setSubmitError(typeof err === 'string' ? err : 'Không thể xóa môn học đang được sử dụng.');
    }
  };

  return (
    <div className="subject-page">
      <div className="subject-header">
        <div>
          <h2>Quản lý môn học</h2>
          <p>Danh sách môn học trong hệ thống</p>
        </div>
        {canEdit && (
          <button
            type="button"
            className="primary-btn"
            onClick={() => openModal('create')}
          >
            Thêm môn học
          </button>
        )}
      </div>

      {flash && <div className="alert success">{flash}</div>}
      {error && <div className="alert error">{error}</div>}

      <SubjectTable
        subjects={subjects}
        departments={departments}
        loading={loading}
        canEdit={canEdit}
        onView={(sub) => openModal('view', sub)}
        onEdit={(sub) => openModal('edit', sub)}
        onDelete={(sub) => openModal('delete', sub)}
      />

      {modalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalMode === 'create' && 'Thêm môn học'}
                {modalMode === 'edit' && 'Chỉnh sửa môn học'}
                {modalMode === 'view' && 'Thông tin môn học'}
                {modalMode === 'delete' && 'Xóa môn học'}
              </h3>
              <button type="button" className="icon-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            {(modalMode === 'create' || modalMode === 'edit') && (
              <SubjectForm
                values={formData}
                departments={departments}
                errors={formErrors}
                submitError={submitError}
                mode={modalMode}
                onChange={handleFormChange}
                onSubmit={handleSubmit}
                onCancel={closeModal}
              />
            )}

            {modalMode === 'view' && selectedSubject && (
              <div className="modal-content">
                <p>
                  <strong>Tên môn học:</strong> {selectedSubject.SubjectName}
                </p>
                <p>
                  <strong>Số tín chỉ:</strong> {selectedSubject.Credit}
                </p>
                <p>
                  <strong>Khoa:</strong>{' '}
                  {departments.find((d) => d.department_id === selectedSubject.DepartmentID)
                    ?.department_name || '-'}
                </p>
                <p>
                  <strong>Mô tả:</strong> {selectedSubject.Description || '-'}
                </p>
                <div className="modal-actions">
                  <button type="button" className="primary-btn" onClick={closeModal}>
                    Đóng
                  </button>
                </div>
              </div>
            )}

            {modalMode === 'delete' && selectedSubject && (
              <div className="modal-content">
                <p>
                  Bạn có chắc muốn xóa môn học{' '}
                  <strong>{selectedSubject.SubjectName}</strong>?
                </p>
                {submitError && <div className="alert error">{submitError}</div>}
                <div className="modal-actions">
                  <button type="button" className="ghost-btn" onClick={closeModal}>
                    Không
                  </button>
                  <button
                    type="button"
                    className="danger-btn"
                    onClick={() => handleDelete(selectedSubject)}
                  >
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

export default SubjectList;
