import React, { useEffect, useMemo, useState } from 'react';
import instituteService from '../../../services/instituteService';
import './InstituteList.css';

const emptyForm = {
  institute_name: '',
  description: '',
};

function InstituteList() {
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedInstitute, setSelectedInstitute] = useState(null);
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

  const loadInstitutes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await instituteService.getAll();
      setInstitutes(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách viện.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitutes();
  }, []);

  const openModal = (mode, institute = null) => {
    setModalMode(mode);
    setSelectedInstitute(institute);
    setSubmitError('');
    setFormErrors({});
    setFlash('');

    if (mode === 'create') {
      setFormData(emptyForm);
    } else if (institute) {
      setFormData({
        institute_name: institute.institute_name || '',
        description: institute.description || '',
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedInstitute(null);
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

    try {
      if (modalMode === 'create') {
        await instituteService.create(formData);
        setFlash('Thêm viện thành công');
      } else if (modalMode === 'edit' && selectedInstitute) {
        await instituteService.update(selectedInstitute.institute_id, formData);
        setFlash('Cập nhật viện thành công');
      }
      closeModal();
      loadInstitutes();
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

  const handleDelete = async (institute) => {
    setSubmitError('');
    setFlash('');
    try {
      await instituteService.remove(institute.institute_id);
      setFlash('Xóa viện thành công');
      closeModal();
      loadInstitutes();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Không thể xóa viện.');
    }
  };

  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('vi-VN');
  };

  return (
    <div className="institute-page">
      <div className="institute-header">
        <div>
          <h2>Quản lý viện</h2>
          <p>Danh sách viện trong hệ thống</p>
        </div>
        {canEdit && (
          <button
            type="button"
            className="primary-btn"
            onClick={() => openModal('create')}
          >
            Thêm viện
          </button>
        )}
      </div>

      {flash && <div className="alert success">{flash}</div>}
      {error && <div className="alert error">{error}</div>}

      <div className="institute-table-wrapper">
        <table className="institute-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên viện</th>
              <th>Mô tả</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="4" className="muted">
                  Đang tải dữ liệu...
                </td>
              </tr>
            )}
            {!loading && institutes.length === 0 && (
              <tr>
                <td colSpan="4" className="muted">
                  Chưa có viện nào.
                </td>
              </tr>
            )}
            {!loading &&
              institutes.map((inst) => (
                <tr key={inst.institute_id}>
                  <td>{inst.institute_id}</td>
                  <td>{inst.institute_name}</td>
                  <td>{inst.description || '-'}</td>
                  <td>
                    <div className="action-group">
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={() => openModal('view', inst)}
                      >
                        Xem
                      </button>
                      {canEdit && (
                        <>
                          <button
                            type="button"
                            className="ghost-btn"
                            onClick={() => openModal('edit', inst)}
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="danger-btn"
                            onClick={() => openModal('delete', inst)}
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
                {modalMode === 'create' && 'Thêm viện'}
                {modalMode === 'edit' && 'Chỉnh sửa viện'}
                {modalMode === 'view' && 'Thông tin viện'}
                {modalMode === 'delete' && 'Xóa viện'}
              </h3>
              <button
                type="button"
                className="icon-btn"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            {submitError && <div className="alert error">{submitError}</div>}

            {(modalMode === 'create' || modalMode === 'edit') && (
              <form onSubmit={handleSubmit} className="modal-form">
                <label>
                  Tên viện
                  <input
                    type="text"
                    name="institute_name"
                    value={formData.institute_name}
                    onChange={handleChange}
                  />
                  {formErrors.institute_name && (
                    <span className="field-error">
                      {formErrors.institute_name}
                    </span>
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
                    <span className="field-error">
                      {formErrors.description}
                    </span>
                  )}
                </label>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={closeModal}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="primary-btn">
                    {modalMode === 'create' ? 'Lưu' : 'Cập nhật'}
                  </button>
                </div>
              </form>
            )}

            {modalMode === 'view' && selectedInstitute && (
              <div className="modal-content">
                <p>
                  <strong>Tên viện:</strong> {selectedInstitute.institute_name}
                </p>
                <p>
                  <strong>Mô tả:</strong>{' '}
                  {selectedInstitute.description || '-'}
                </p>
                <p>
                  <strong>Ngày tạo:</strong>{' '}
                  {formatDate(selectedInstitute.created_date)}
                </p>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={closeModal}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}

            {modalMode === 'delete' && selectedInstitute && (
              <div className="modal-content">
                <p>
                  Bạn có chắc muốn xóa viện{' '}
                  <strong>{selectedInstitute.institute_name}</strong>?
                </p>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={closeModal}
                  >
                    Không
                  </button>
                  <button
                    type="button"
                    className="danger-btn"
                    onClick={() => handleDelete(selectedInstitute)}
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

export default InstituteList;

