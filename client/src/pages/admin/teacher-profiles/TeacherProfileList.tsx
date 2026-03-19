import React, { useEffect, useMemo, useState } from 'react';
import teacherProfileService from '../../../services/teacherProfileService';
import departmentService from '../../../services/departmentService';
import userService from '../../../services/userService';
import { TeacherProfile, TeacherProfilePayload, Department, User } from '../../../types';
import TeacherProfileTable from './components/TeacherProfileTable';
import TeacherProfileForm from './components/TeacherProfileForm';
import './TeacherProfileList.css';

type ModalMode = 'create' | 'edit' | 'view' | 'delete';

const emptyForm: TeacherProfilePayload = {
  user_id: '',
  department_id: '',
  full_name: '',
  gender: '',
  birth_date: '',
  phone: '',
  degree: '',
  academic_rank: '',
};

function TeacherProfileList() {
  const [profiles, setProfiles] = useState<TeacherProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [selectedProfile, setSelectedProfile] = useState<TeacherProfile | null>(null);
  const [formData, setFormData] = useState<TeacherProfilePayload>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const canEdit = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      return u?.role === 0; // Only admin
    } catch {
      return false;
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [profilesRes, deptsRes, usersRes] = await Promise.all([
        teacherProfileService.getAll(),
        departmentService.getAll(),
        userService.getAll(),
      ]);
      setProfiles(profilesRes.data || []);
      setDepartments(deptsRes.data || []);
      // Filter only users with role 1 (Teacher)
      setUsers((usersRes.data || []).filter((u: User) => u.role === 1));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (mode: ModalMode, profile: TeacherProfile | null = null) => {
    setModalMode(mode);
    setSelectedProfile(profile);
    setSubmitError('');
    setFormErrors({});
    setFlash('');

    if (mode === 'create') {
      setFormData(emptyForm);
    } else if (profile) {
      setFormData({
        user_id: profile.user_id ? String(profile.user_id) : '',
        department_id: profile.department_id ? String(profile.department_id) : '',
        full_name: profile.full_name || '',
        gender: profile.gender || '',
        birth_date: profile.birth_date || '',
        phone: profile.phone || '',
        degree: profile.degree || '',
        academic_rank: profile.academic_rank || '',
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

  const handleFormChange = (field: keyof TeacherProfilePayload, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async () => {
    setSubmitError('');

    const payload: TeacherProfilePayload = {
      ...formData,
      user_id: formData.user_id ? Number(formData.user_id) : undefined,
      department_id: formData.department_id ? Number(formData.department_id) : undefined,
    };

    try {
      if (modalMode === 'create') {
        await teacherProfileService.create(payload);
        setFlash('Thêm hồ sơ giảng viên thành công');
      } else if (modalMode === 'edit' && selectedProfile) {
        await teacherProfileService.update(selectedProfile.teacher_id, payload);
        setFlash('Cập nhật hồ sơ giảng viên thành công');
      }
      closeModal();
      loadData();
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

  const handleDelete = async (profile: TeacherProfile) => {
    setSubmitError('');
    setFlash('');
    try {
      await teacherProfileService.remove(profile.teacher_id);
      setFlash('Xóa hồ sơ giảng viên thành công');
      closeModal();
      loadData();
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Không thể xóa hồ sơ.');
    }
  };

  const formatDate = (value?: string) => {
      if (!value) return '-';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;
      return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="teacher-profile-page">
      <div className="teacher-profile-header">
        <div>
          <h2>Quản lý Giảng viên</h2>
          <p>Danh sách hồ sơ giảng viên trong hệ thống</p>
        </div>
        {canEdit && (
          <button
            type="button"
            className="primary-btn"
            onClick={() => openModal('create')}
          >
            Thêm giảng viên
          </button>
        )}
      </div>

      {flash && <div className="alert success">{flash}</div>}
      {error && <div className="alert error">{error}</div>}

      <TeacherProfileTable
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
                {modalMode === 'create' && 'Thêm hồ sơ giảng viên'}
                {modalMode === 'edit' && 'Chỉnh sửa hồ sơ'}
                {modalMode === 'view' && 'Thông tin giảng viên'}
                {modalMode === 'delete' && 'Xóa hồ sơ'}
              </h3>
              <button type="button" className="icon-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            {(modalMode === 'create' || modalMode === 'edit') && (
              <TeacherProfileForm
                values={formData}
                departments={departments}
                users={users}
                errors={formErrors}
                submitError={submitError}
                mode={modalMode}
                onChange={handleFormChange}
                onSubmit={handleSubmit}
                onCancel={closeModal}
              />
            )}

            {modalMode === 'view' && selectedProfile && (
              <div className="modal-content">
                <p><strong>Mã giảng viên:</strong> {selectedProfile.teacher_id}</p>
                <p><strong>Họ và tên:</strong> {selectedProfile.full_name}</p>
                <p><strong>Giới tính:</strong> {selectedProfile.gender || '-'}</p>
                <p><strong>Ngày sinh:</strong> {formatDate(selectedProfile.birth_date)}</p>
                <p><strong>Khoa:</strong> {selectedProfile.department?.department_name || '-'}</p>
                <p><strong>Email:</strong> {selectedProfile.user?.email || '-'}</p>
                <p><strong>Số điện thoại:</strong> {selectedProfile.phone || '-'}</p>
                <p><strong>Bằng cấp:</strong> {selectedProfile.degree || '-'}</p>
                <p><strong>Chức danh / Học hàm:</strong> {selectedProfile.academic_rank || '-'}</p>
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
                  Bạn có chắc muốn xóa hồ sơ giảng viên{' '}
                  <strong>{selectedProfile.full_name}</strong>?
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

export default TeacherProfileList;
