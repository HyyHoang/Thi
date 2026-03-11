import React, { useEffect, useMemo, useState } from 'react';
import userService from '../../../services/userService';
import './UserList.css';

const ROLE_OPTIONS = [
  { value: 0, label: 'Admin' },
  { value: 1, label: 'Teacher' },
  { value: 2, label: 'Student' },
];

const emptyForm = {
  username: '',
  password: '',
  email: '',
  avt: '',
  role: 2,
};

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const roleLabel = useMemo(() => {
    const map = new Map(ROLE_OPTIONS.map(r => [r.value, r.label]));
    return (value) => map.get(value) || 'Unknown';
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userService.getAll();
      setUsers(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openModal = (mode, user = null) => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'role' ? Number(value) : value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    } catch (err) {
      const apiErrors = err.response?.data?.errors || {};
      if (Object.keys(apiErrors).length > 0) {
        const mapped = {};
        Object.keys(apiErrors).forEach((key) => {
          mapped[key] = apiErrors[key]?.[0] || '';
        });
        setFormErrors(mapped);
      }
      setSubmitError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const handleDelete = async (user) => {
    setSubmitError('');
    setFlash('');
    try {
      await userService.remove(user.user_id);
      setFlash('Xóa tài khoản thành công');
      closeModal();
      loadUsers();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Không thể xóa tài khoản.');
    }
  };

  const formatDate = (value) => {
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

      <div className="user-table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>UserID</th>
              <th>Username</th>
              <th>Email</th>
              <th>AVT</th>
              <th>Role</th>
              <th>CreatedDate</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="7" className="muted">Đang tải dữ liệu...</td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan="7" className="muted">Chưa có tài khoản nào.</td>
              </tr>
            )}
            {!loading && users.map(user => (
              <tr key={user.user_id}>
                <td>{user.user_id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.avt || '-'}</td>
                <td>{roleLabel(user.role)}</td>
                <td>{formatDate(user.created_date)}</td>
                <td>
                  <div className="action-group">
                    <button type="button" className="ghost-btn" onClick={() => openModal('view', user)}>
                      Xem
                    </button>
                    <button type="button" className="ghost-btn" onClick={() => openModal('edit', user)}>
                      Sửa
                    </button>
                    <button type="button" className="danger-btn" onClick={() => openModal('delete', user)}>
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
              <button type="button" className="icon-btn" onClick={closeModal}>×</button>
            </div>

            {submitError && <div className="alert error">{submitError}</div>}

            {(modalMode === 'create' || modalMode === 'edit') && (
              <form onSubmit={handleSubmit} className="modal-form">
                <label>
                  Username
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                  {formErrors.username && <span className="field-error">{formErrors.username}</span>}
                </label>

                <label>
                  Password {modalMode === 'edit' && '(để trống nếu không đổi)'}
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {formErrors.password && <span className="field-error">{formErrors.password}</span>}
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {formErrors.email && <span className="field-error">{formErrors.email}</span>}
                </label>

                <label>
                  AVT
                  <input
                    type="text"
                    name="avt"
                    value={formData.avt}
                    onChange={handleChange}
                    placeholder="Link ảnh đại diện"
                  />
                  {formErrors.avt && <span className="field-error">{formErrors.avt}</span>}
                </label>

                <label>
                  Role
                  <select name="role" value={formData.role} onChange={handleChange}>
                    {ROLE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  {formErrors.role && <span className="field-error">{formErrors.role}</span>}
                </label>

                <div className="modal-actions">
                  <button type="button" className="ghost-btn" onClick={closeModal}>Hủy</button>
                  <button type="submit" className="primary-btn">
                    {modalMode === 'create' ? 'Lưu' : 'Cập nhật'}
                  </button>
                </div>
              </form>
            )}

            {modalMode === 'view' && selectedUser && (
              <div className="modal-content">
                <p><strong>Username:</strong> {selectedUser.username}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>AVT:</strong> {selectedUser.avt || '-'}</p>
                <p><strong>Role:</strong> {roleLabel(selectedUser.role)}</p>
                <p><strong>Ngày tạo:</strong> {formatDate(selectedUser.created_date)}</p>
                <div className="modal-actions">
                  <button type="button" className="primary-btn" onClick={closeModal}>Đóng</button>
                </div>
              </div>
            )}

            {modalMode === 'delete' && selectedUser && (
              <div className="modal-content">
                <p>Bạn có chắc muốn xóa tài khoản <strong>{selectedUser.username}</strong>?</p>
                <div className="modal-actions">
                  <button type="button" className="ghost-btn" onClick={closeModal}>Không</button>
                  <button type="button" className="danger-btn" onClick={() => handleDelete(selectedUser)}>Có</button>
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
