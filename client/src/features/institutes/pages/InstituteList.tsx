import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../lib/store/redux/hooks';
import { fetchInstitutes, createInstitute, updateInstitute, deleteInstitute } from '../redux/instituteThunks';
import {
  selectInstitutes,
  selectInstitutesError,
  selectInstitutesLoading,
} from '../redux/instituteSelectors';
import { Institute, InstitutePayload } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { CrudLayout } from '../../../components/layout/CrudLayout';
import { MdAdd, MdInfoOutline, MdWarningAmber } from 'react-icons/md';
import InstituteTable from '../components/InstituteTable';
import InstituteForm from '../components/InstituteForm';

type ModalMode = 'create' | 'edit' | 'view' | 'delete';

const emptyForm: InstitutePayload = {
  institute_name: '',
  description: '',
};

function InstituteList() {
  const dispatch = useAppDispatch();
  const institutes = useAppSelector(selectInstitutes);
  const loading = useAppSelector(selectInstitutesLoading);
  const error = useAppSelector(selectInstitutesError) || '';

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

  useEffect(() => {
    dispatch(fetchInstitutes());
  }, [dispatch]);

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

  const handleFormChange = (field: string | number | symbol, value: string) => {
    setFormData((prev) => ({ ...prev, [field as keyof InstitutePayload]: value }));
    setFormErrors((prev) => ({ ...prev, [field as string]: '' }));
  };

  const handleSubmit = async () => {
    setSubmitError('');

    try {
      if (modalMode === 'create') {
        await dispatch(createInstitute(formData)).unwrap();
        setFlash('Thêm viện thành công');
      } else if (modalMode === 'edit' && selectedInstitute) {
        await dispatch(updateInstitute({ id: selectedInstitute.institute_id, payload: formData })).unwrap();
        setFlash('Cập nhật viện thành công');
      }
      closeModal();
      dispatch(fetchInstitutes());
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
      await dispatch(deleteInstitute(institute.institute_id)).unwrap();
      setFlash('Xóa viện thành công');
      closeModal();
      dispatch(fetchInstitutes());
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Không thể xóa viện.');
    }
  };

  return (
    <CrudLayout
      title="Quản lý viện"
      description="Danh sách các viện trong hệ thống"
      flash={flash}
      error={error}
      action={
          canEdit ? (
            <Button variant="primary" onClick={() => openModal('create')}>
              <MdAdd size={20} /> Thêm viện
            </Button>
          ) : null
        }
    >
        <InstituteTable
          institutes={institutes}
          loading={loading}
          canEdit={canEdit}
          onView={(ins) => openModal('view', ins)}
          onEdit={(ins) => openModal('edit', ins)}
          onDelete={(ins) => openModal('delete', ins)}
        />
      

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={
          modalMode === 'create' ? 'Thêm viện' :
          modalMode === 'edit' ? 'Chỉnh sửa viện' :
          modalMode === 'view' ? 'Thông tin viện' :
          modalMode === 'delete' ? 'Xóa viện' : ''
        }
      >
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
          <div style={{ padding: '10px 0' }}>
            <p>
              <strong>Tên viện:</strong> {selectedInstitute.institute_name}
            </p>
            <p>
              <strong>Mô tả:</strong> {selectedInstitute.description || '-'}
            </p>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" onClick={closeModal}>
                Đóng
              </Button>
            </div>
          </div>
        )}

        {modalMode === 'delete' && selectedInstitute && (
          <div style={{ padding: '10px 0' }}>
            <p>
              Bạn có chắc muốn xóa viện{' '}
              <strong>{selectedInstitute.institute_name}</strong>?
            </p>
            {submitError && <div className="alert error">{submitError}</div>}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="ghost" onClick={closeModal}>
                Không
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(selectedInstitute)}
              >
                Có, xóa
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </CrudLayout>
  );
}

export default InstituteList;
