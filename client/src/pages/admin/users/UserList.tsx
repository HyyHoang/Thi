import React, { useEffect, useState } from 'react';
import userService from '../../../services/userService';
import { User, UserPayload } from '../../../types';
import UserTable from './components/UserTable';
import UserForm from './components/UserForm';
import './UserList.css';

type ModalMode = 'create' | 'edit' | 'view' | 'delete';

const emptyForm: UserPayload = {
  username: '',
  password: '',
  email: '',
  avt: '',
  role: 2,
};

const ROLE_OPTIONS = [
  { value: 0, label: 'Admin' },
  { value: 1, label: 'Teacher' },
  { value: 2, label: 'Student' },
];

function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserPayload>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const roleLabel = (value: number) => {
    const option = ROLE_OPTIONS.find((r) => r.value === value);
    return option ? option.label : 'Unknown';
  };

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userService.getAll();
      setUsers(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openModal = (mode: ModalMode, user: User | null = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    setSubmitError('');
    setFormErrors({});
    if (mode === 'create') {
      setFormData(emptyForm);
    } else if (user) {
      setFormData({
        username: user.username || '',
        password: '',
        email: user.email || '',
        avt: user.avt || '',
        role: user.role ?? 2,
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
    setSubmitError('');
    setFormErrors({});
  };

  const handleFormChange = (field: keyof UserPayload, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async () => {
    setSubmitError('');
    setFlash('');

    try {
      if (modalMode === 'create') {
        await userService.create(formData);
        setFlash('Tạo tài khoản thành công');
      } else if (modalMode === 'edit' && selectedUser) {
        await userService.update(selectedUser.user_id, formData);
        setFlash('Cập nhật tài khoản thành công');
      }
      closeModal();
      loadUsers();
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

  const handleDelete = async (user: User) => {
    setSubmitError('');
    setFlash('');
    try {
      await userService.remove(user.user_id);
      setFlash('Xóa tài khoản thành công');
      closeModal();
      loadUsers();
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Không thể xóa tài khoản.');
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('vi-VN');
  };

  return (
    <div className="user-list-page">
      <div className="user-list-header">
        <div>
          <h2>Quản lý tài khoản</h2>
          <p>Danh sách tài khoản người dùng trong hệ thống</p>
        </div>
        <button type="button" className="primary-btn" onClick={() => openModal('create')}>
          Thêm tài khoản
        </button>
      </div>

      {flash && <div className="alert success">{flash}</div>}
      {error && <div className="alert error">{error}</div>}

      <UserTable
        users={users}
        loading={loading}
        canEdit={true}
        onView={(usr) => openModal('view', usr)}
        onEdit={(usr) => openModal('edit', usr)}
        onDelete={(usr) => openModal('delete', usr)}
      />

      {modalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalMode === 'create' && 'Thêm tài khoản'}
                {modalMode === 'edit' && 'Chỉnh sửa tài khoản'}
                {modalMode === 'view' && 'Thông tin tài khoản'}
                {modalMode === 'delete' && 'Xóa tài khoản'}
              </h3>
              <button type="button" className="icon-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            {(modalMode === 'create' || modalMode === 'edit') && (
              <UserForm
                values={formData}
                errors={formErrors}
                submitError={submitError}
                mode={modalMode}
                onChange={handleFormChange}
                onSubmit={handleSubmit}
                onCancel={closeModal}
              />
            )}

            {modalMode === 'view' && selectedUser && (
              <div className="modal-content">
                <p>
                  <strong>Username:</strong> {selectedUser.username}
                </p>
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p>
                  <strong>AVT:</strong> {selectedUser.avt || '-'}
                </p>
                <p>
                  <strong>Role:</strong> {roleLabel(selectedUser.role)}
                </p>
                <p>
                  <strong>Ngày tạo:</strong> {formatDate(selectedUser.created_date)}
                </p>
                <div className="modal-actions">
                  <button type="button" className="primary-btn" onClick={closeModal}>
                    Đóng
                  </button>
                </div>
              </div>
            )}

            {modalMode === 'delete' && selectedUser && (
              <div className="modal-content">
                <p>
                  Bạn có chắc muốn xóa tài khoản <strong>{selectedUser.username}</strong>?
                </p>
                {submitError && <div className="alert error">{submitError}</div>}
                <div className="modal-actions">
                  <button type="button" className="ghost-btn" onClick={closeModal}>
                    Không
                  </button>
                  <button
                    type="button"
                    className="danger-btn"
                    onClick={() => handleDelete(selectedUser)}
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

export default UserList;
