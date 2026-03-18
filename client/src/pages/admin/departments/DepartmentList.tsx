import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchDepartments } from '../../../features/departments/departmentSlice';
import {
  selectDepartments,
  selectDepartmentsError,
  selectDepartmentsLoading,
} from '../../../features/departments/selectors';
import instituteService from '../../../services/instituteService';
import departmentService from '../../../services/departmentService';
import { Department, DepartmentPayload, Institute } from '../../../types';
import DepartmentTable from './components/DepartmentTable';
import DepartmentForm from './components/DepartmentForm';
import './DepartmentList.css';

type ModalMode = 'create' | 'edit' | 'view' | 'delete';

const emptyForm: DepartmentPayload & { institute_id: number | string } = {
  department_name: '',
  institute_id: '',
  description: '',
};

function DepartmentList() {
  const dispatch = useAppDispatch();
  const departments = useAppSelector(selectDepartments);
  const loading = useAppSelector(selectDepartmentsLoading);
  const error = useAppSelector(selectDepartmentsError) || '';

  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [flash, setFlash] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [formData, setFormData] =
    useState<DepartmentPayload & { institute_id: number | string }>(emptyForm);
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

  const loadInstitutes = async () => {
    try {
      const response = await instituteService.getAll();
      setInstitutes(response.data || []);
    } catch {
      // ignore; dropdown sẽ trống và form sẽ validate khi submit
    }
  };

  useEffect(() => {
    dispatch(fetchDepartments());
    loadInstitutes();
  }, [dispatch]);

  const openModal = (mode: ModalMode, department: Department | null = null) => {
    setModalMode(mode);
    setSelectedDepartment(department);
    setSubmitError('');
    setFormErrors({});
    setFlash('');

    if (mode === 'create') {
      setFormData(emptyForm);
    } else if (department) {
      setFormData({
        department_name: department.department_name || '',
        institute_id: department.institute_id ? String(department.institute_id) : '',
        description: department.description || '',
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedDepartment(null);
    setSubmitError('');
    setFormErrors({});
  };

  const handleFormChange = (field: keyof DepartmentPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async () => {
    setSubmitError('');

    const payload: DepartmentPayload = {
      department_name: formData.department_name,
      institute_id: formData.institute_id ? Number(formData.institute_id) : formData.institute_id,
      description: formData.description,
    };

    try {
      if (modalMode === 'create') {
        await departmentService.create(payload);
        setFlash('Thêm khoa thành công');
      } else if (modalMode === 'edit' && selectedDepartment) {
        await departmentService.update(selectedDepartment.department_id, payload);
        setFlash('Cập nhật khoa thành công');
      }
      closeModal();
      dispatch(fetchDepartments());
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

  const handleDelete = async (department: Department) => {
    setSubmitError('');
    setFlash('');
    try {
      await departmentService.remove(department.department_id);
      setFlash('Xóa khoa thành công');
      closeModal();
      dispatch(fetchDepartments());
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Không thể xóa khoa.');
    }
  };

  return (
    <div className="department-page">
      <div className="department-header">
        <div>
          <h2>Quản lý khoa</h2>
          <p>Danh sách khoa trong hệ thống</p>
        </div>
        {canEdit && (
          <button
            type="button"
            className="primary-btn"
            onClick={() => openModal('create')}
          >
            Thêm khoa
          </button>
        )}
      </div>

      {flash && <div className="alert success">{flash}</div>}
      {error && <div className="alert error">{error}</div>}

      <DepartmentTable
        departments={departments}
        institutes={institutes}
        loading={loading}
        canEdit={canEdit}
        onView={(dep) => openModal('view', dep)}
        onEdit={(dep) => openModal('edit', dep)}
        onDelete={(dep) => openModal('delete', dep)}
      />

      {modalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalMode === 'create' && 'Thêm khoa'}
                {modalMode === 'edit' && 'Chỉnh sửa khoa'}
                {modalMode === 'view' && 'Thông tin khoa'}
                {modalMode === 'delete' && 'Xóa khoa'}
              </h3>
              <button type="button" className="icon-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            {(modalMode === 'create' || modalMode === 'edit') && (
              <DepartmentForm
                values={formData}
                institutes={institutes}
                errors={formErrors}
                submitError={submitError}
                mode={modalMode}
                onChange={handleFormChange}
                onSubmit={handleSubmit}
                onCancel={closeModal}
              />
            )}

            {modalMode === 'view' && selectedDepartment && (
              <div className="modal-content">
                <p>
                  <strong>Tên khoa:</strong> {selectedDepartment.department_name}
                </p>
                <p>
                  <strong>Viện:</strong>{' '}
                  {institutes.find((i) => i.institute_id === selectedDepartment.institute_id)
                    ?.institute_name || selectedDepartment.institute_name || '-'}
                </p>
                <p>
                  <strong>Mô tả:</strong> {selectedDepartment.description || '-'}
                </p>
                <div className="modal-actions">
                  <button type="button" className="primary-btn" onClick={closeModal}>
                    Đóng
                  </button>
                </div>
              </div>
            )}

            {modalMode === 'delete' && selectedDepartment && (
              <div className="modal-content">
                <p>
                  Bạn có chắc muốn xóa khoa{' '}
                  <strong>{selectedDepartment.department_name}</strong>?
                </p>
                {submitError && <div className="alert error">{submitError}</div>}
                <div className="modal-actions">
                  <button type="button" className="ghost-btn" onClick={closeModal}>
                    Không
                  </button>
                  <button
                    type="button"
                    className="danger-btn"
                    onClick={() => handleDelete(selectedDepartment)}
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

export default DepartmentList;

