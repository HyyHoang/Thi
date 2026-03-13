import React, { useEffect, useMemo, useState } from 'react';
import departmentService from '../../../services/departmentService';
import instituteService from '../../../services/instituteService';
import './DepartmentList.css';

const emptyForm = {
  department_name: '',
  institute_id: '',
  description: '',
};

function DepartmentList() {
  const [departments, setDepartments] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
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
    setLoading(true);
    setError('');
    try {
      const response = await departmentService.getAll();
      setDepartments(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách khoa.');
    } finally {
      setLoading(false);
    }
  };

  const loadInstitutes = async () => {
    try {
      const response = await instituteService.getAll();
      setInstitutes(response.data || []);
    } catch {
      // ignore; dropdown will be empty and form will validate on submit
    }
  };

  useEffect(() => {
    loadDepartments();
    loadInstitutes();
  }, []);

  const openModal = (mode, department = null) => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const payload = {
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
      loadDepartments();
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

  const handleDelete = async (department) => {
    setSubmitError('');
    setFlash('');
    try {
      await departmentService.remove(department.department_id);
      setFlash('Xóa khoa thành công');
      closeModal();
      loadDepartments();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Không thể xóa khoa.');
    }
  };

  const instituteNameFor = (department) => {
    if (department?.institute_name) return department.institute_name;
    const found = institutes.find((i) => i.institute_id === department?.institute_id);
    return found?.institute_name || '-';
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

      <div className="department-table-wrapper">
        <table className="department-table">
          <thead>
            <tr>
              <th>DepartmentID</th>
              <th>DepartmentName</th>
              <th>InstituteName</th>
              <th>Description</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="5" className="muted">
                  Đang tải dữ liệu...
                </td>
              </tr>
            )}
            {!loading && departments.length === 0 && (
              <tr>
                <td colSpan="5" className="muted">
                  Chưa có khoa nào.
                </td>
              </tr>
            )}
            {!loading &&
              departments.map((dep) => (
                <tr key={dep.department_id}>
                  <td>{dep.department_id}</td>
                  <td>{dep.department_name}</td>
                  <td>{instituteNameFor(dep)}</td>
                  <td>{dep.description || '-'}</td>
                  <td>
                    <div className="action-group">
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={() => openModal('view', dep)}
                      >
                        Xem
                      </button>
                      {canEdit && (
                        <>
                          <button
                            type="button"
                            className="ghost-btn"
                            onClick={() => openModal('edit', dep)}
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="danger-btn"
                            onClick={() => openModal('delete', dep)}
                          >
                            Xóa
                          </button>
                        </>
                      )}
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
                {modalMode === 'create' && 'Thêm khoa'}
                {modalMode === 'edit' && 'Chỉnh sửa khoa'}
                {modalMode === 'view' && 'Thông tin khoa'}
                {modalMode === 'delete' && 'Xóa khoa'}
              </h3>
              <button type="button" className="icon-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            {submitError && <div className="alert error">{submitError}</div>}

            {(modalMode === 'create' || modalMode === 'edit') && (
              <form onSubmit={handleSubmit} className="modal-form">
                <label>
                  Tên khoa
                  <input
                    type="text"
                    name="department_name"
                    value={formData.department_name}
                    onChange={handleChange}
                  />
                  {formErrors.department_name && (
                    <span className="field-error">{formErrors.department_name}</span>
                  )}
                </label>

                <label>
                  Viện
                  <select
                    name="institute_id"
                    value={formData.institute_id}
                    onChange={handleChange}
                  >
                    <option value="">-- Chọn viện --</option>
                    {institutes.map((inst) => (
                      <option key={inst.institute_id} value={String(inst.institute_id)}>
                        {inst.institute_name}
                      </option>
                    ))}
                  </select>
                  {formErrors.institute_id && (
                    <span className="field-error">{formErrors.institute_id}</span>
                  )}
                </label>

                <label>
                  Mô tả
                  <textarea
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                  />
                  {formErrors.description && (
                    <span className="field-error">{formErrors.description}</span>
                  )}
                </label>

                <div className="modal-actions">
                  <button type="button" className="ghost-btn" onClick={closeModal}>
                    Hủy
                  </button>
                  <button type="submit" className="primary-btn">
                    {modalMode === 'create' ? 'Lưu' : 'Cập nhật'}
                  </button>
                </div>
              </form>
            )}

            {modalMode === 'view' && selectedDepartment && (
              <div className="modal-content">
                <p>
                  <strong>Tên khoa:</strong> {selectedDepartment.department_name}
                </p>
                <p>
                  <strong>Viện:</strong> {instituteNameFor(selectedDepartment)}
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

