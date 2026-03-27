import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchStudentProfiles } from '../../../features/student-profiles/studentProfileSlice';
import {
  selectStudentProfiles,
  selectStudentProfilesError,
  selectStudentProfilesLoading,
} from '../../../features/student-profiles/selectors';
import departmentService from '../../../services/departmentService';
import { studentProfileService } from '../../../services/studentProfileService';
import { StudentProfile, StudentProfilePayload, Department, User } from '../../../types';
import StudentProfileTable from './components/StudentProfileTable';
import StudentProfileForm from './components/StudentProfileForm';
import axiosClient from '../../../api/axiosClient';
import './StudentProfileList.css';

type ModalMode = 'create' | 'edit' | 'view' | 'delete';

const emptyForm: StudentProfilePayload = {
  UserID: '',
  DepartmentID: '',
  FullName: '',
  EnrollmentYear: new Date().getFullYear(),
  Status: 1,
};

function StudentProfileList() {
  const dispatch = useAppDispatch();
  const profiles = useAppSelector(selectStudentProfiles);
  const loading = useAppSelector(selectStudentProfilesLoading);
  const error = useAppSelector(selectStudentProfilesError) || '';

  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [flash, setFlash] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(null);
  const [formData, setFormData] = useState<StudentProfilePayload>(emptyForm);
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

  const loadDependencies = async () => {
    try {
      const [depRes, userRes] = await Promise.all([
        departmentService.getAll(),
        axiosClient.get('/users'), // Adjust if there's a specific user service
      ]);
      setDepartments(depRes.data || []);
      
      const allUsers = userRes.data || [];
      // Filter for role == 2 (students) assuming role 2 is student. If generic, we can show role 2 users.
      const studentUsers = allUsers.filter((u: User) => u.role === 2);
      setUsers(studentUsers.length > 0 ? studentUsers : allUsers);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    dispatch(fetchStudentProfiles());
    if (canEdit) {
      loadDependencies();
    }
  }, [dispatch, canEdit]);

  const openModal = (mode: ModalMode, profile: StudentProfile | null = null) => {
    setModalMode(mode);
    setSelectedProfile(profile);
    setSubmitError('');
    setFormErrors({});
    setFlash('');

    if (mode === 'create') {
      setFormData(emptyForm);
    } else if (profile) {
      setFormData({
        UserID: profile.UserID || '',
        DepartmentID: profile.DepartmentID || '',
        FullName: profile.FullName || '',
        EnrollmentYear: profile.EnrollmentYear || new Date().getFullYear(),
        Status: profile.Status || 1,
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedProfile(null);
    setSubmitError('');
    setFormErrors({});
  };

  const handleFormChange = (field: keyof StudentProfilePayload, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async () => {
    setSubmitError('');

    const payload: StudentProfilePayload = {
      ...formData,
      EnrollmentYear: Number(formData.EnrollmentYear),
      Status: Number(formData.Status),
    };

    try {
      if (modalMode === 'create') {
        await studentProfileService.create(payload);
        setFlash('Thêm hồ sơ sinh viên thành công');
      } else if (modalMode === 'edit' && selectedProfile) {
        await studentProfileService.update(selectedProfile.StudentID, payload);
        setFlash('Cập nhật hồ sơ thành công');
      }
      closeModal();
      dispatch(fetchStudentProfiles());
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

  const handleDelete = async (profile: StudentProfile) => {
    setSubmitError('');
    setFlash('');
    try {
      await studentProfileService.delete(profile.StudentID);
      setFlash('Xóa hồ sơ sinh viên thành công');
      closeModal();
      dispatch(fetchStudentProfiles());
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Không thể xóa hồ sơ.');
    }
  };

  const statusText = (status: number) => {
    if (status === 1) return 'Đang học';
    if (status === 2) return 'Bảo lưu';
    if (status === 3) return 'Bỏ học';
    return '-';
  };

  return (
    <div className="student-profile-page">
      <div className="student-profile-header">
        <div>
          <h2>Quản lý hồ sơ sinh viên</h2>
          <p>Danh sách sinh viên trong hệ thống</p>
        </div>
        {canEdit && (
          <button
            type="button"
            className="primary-btn"
            onClick={() => openModal('create')}
          >
            Thêm sinh viên
          </button>
        )}
      </div>

      {flash && <div className="alert success">{flash}</div>}
      {error && <div className="alert error">{error}</div>}

      <StudentProfileTable
        profiles={profiles}
        loading={loading}
        canEdit={canEdit}
        onView={(p) => openModal('view', p)}
        onEdit={(p) => openModal('edit', p)}
        onDelete={(p) => openModal('delete', p)}
      />

      {modalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalMode === 'create' && 'Thêm hồ sơ sinh viên'}
                {modalMode === 'edit' && 'Chỉnh sửa hồ sơ'}
                {modalMode === 'view' && 'Thông tin sinh viên'}
                {modalMode === 'delete' && 'Xóa hồ sơ'}
              </h3>
              <button type="button" className="icon-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            {(modalMode === 'create' || modalMode === 'edit') && (
                <StudentProfileForm
                values={formData}
                departments={departments}
                users={users}
                errors={formErrors}
                submitError={submitError}
                mode={modalMode}
                originalUserID={selectedProfile?.UserID}
                onChange={handleFormChange}
                onSubmit={handleSubmit}
                onCancel={closeModal}
              />
            )}

            {modalMode === 'view' && selectedProfile && (
              <div className="modal-content">
                <p>
                  <strong>Mã SV (ID):</strong> {selectedProfile.StudentID}
                </p>
                <p>
                  <strong>Họ tên:</strong> {selectedProfile.FullName}
                </p>
                <p>
                  <strong>Khoá (Năm nhập học):</strong> {selectedProfile.EnrollmentYear}
                </p>
                <p>
                  <strong>Khoa:</strong> {selectedProfile.department?.department_name || selectedProfile.department?.DepartmentName || '-'}
                </p>
                <p>
                  <strong>Tài khoản (Username):</strong> {selectedProfile.user?.username || selectedProfile.user?.Username || '-'}
                </p>
                <p>
                  <strong>Trạng thái:</strong> {statusText(selectedProfile.Status)}
                </p>
                <div className="modal-actions">
                  <button type="button" className="primary-btn" onClick={closeModal}>
                    Đóng
                  </button>
                </div>
              </div>
            )}

            {modalMode === 'delete' && selectedProfile && (
              <div className="modal-content">
                <p>
                  Bạn có chắc muốn xóa hồ sơ sinh viên{' '}
                  <strong>{selectedProfile.FullName}</strong> ({selectedProfile.StudentID})?
                </p>
                {submitError && <div className="alert error">{submitError}</div>}
                <div className="modal-actions">
                  <button type="button" className="ghost-btn" onClick={closeModal}>
                    Không
                  </button>
                  <button
                    type="button"
                    className="danger-btn"
                    onClick={() => handleDelete(selectedProfile)}
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

export default StudentProfileList;
