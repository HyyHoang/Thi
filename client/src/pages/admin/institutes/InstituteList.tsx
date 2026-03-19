import React, { useEffect, useMemo, useState } from 'react';
import instituteService from '../../../services/instituteService';
import { Institute, InstitutePayload } from '../../../types';
import InstituteTable from './components/InstituteTable';
import InstituteForm from './components/InstituteForm';
import './InstituteList.css';

type ModalMode = 'create' | 'edit' | 'view' | 'delete';

const emptyForm: InstitutePayload = {
  institute_name: '',
  description: '',
};

function InstituteList() {
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [selectedInstitute, setSelectedInstitute] = useState<Institute | null>(null);
  const [formData, setFormData] = useState<InstitutePayload>(emptyForm);
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
    setLoading(true);
    setError('');
    try {
      const response = await instituteService.getAll();
      setInstitutes(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách viện.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitutes();
  }, []);

  const openModal = (mode: ModalMode, institute: Institute | null = null) => {
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

  const handleFormChange = (field: keyof InstitutePayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async () => {
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

  const handleDelete = async (institute: Institute) => {
    setSubmitError('');
    setFlash('');
    try {
      await instituteService.remove(institute.institute_id);
      setFlash('Xóa viện thành công');
      closeModal();
      loadInstitutes();
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Không thể xóa viện.');
    }
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

      <InstituteTable
        institutes={institutes}
        loading={loading}
        canEdit={canEdit}
        onView={(inst) => openModal('view', inst)}
        onEdit={(inst) => openModal('edit', inst)}
        onDelete={(inst) => openModal('delete', inst)}
      />

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
              <button type="button" className="icon-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            {(modalMode === 'create' || modalMode === 'edit') && (
              <InstituteForm
                values={formData}
                errors={formErrors}
                submitError={submitError}
                mode={modalMode}
                onChange={handleFormChange}
                onSubmit={handleSubmit}
                onCancel={closeModal}
              />
            )}

            {modalMode === 'view' && selectedInstitute && (
              <div className="modal-content">
                <p>
                  <strong>Tên viện:</strong> {selectedInstitute.institute_name}
                </p>
                <p>
                  <strong>Mô tả:</strong> {selectedInstitute.description || '-'}
                </p>
                <div className="modal-actions">
                  <button type="button" className="primary-btn" onClick={closeModal}>
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
                {submitError && <div className="alert error">{submitError}</div>}
                <div className="modal-actions">
                  <button type="button" className="ghost-btn" onClick={closeModal}>
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
