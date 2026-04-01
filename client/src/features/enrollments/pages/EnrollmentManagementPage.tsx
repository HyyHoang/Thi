import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../lib/store/redux/hooks';
import { fetchEnrollments, createEnrollment, updateEnrollment, deleteEnrollment } from '../api';
import { CrudLayout } from '../../../components/layout/CrudLayout';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { MdAdd } from 'react-icons/md';
import EnrollmentTable from '../components/EnrollmentTable';
import EnrollmentForm from '../components/EnrollmentForm';
import EnrollmentAddForm from '../components/EnrollmentAddForm';
import { Enrollment } from '../types';
import { RootState } from '../../../lib/store/redux/store';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { Pagination } from '../../../components/ui/Pagination';
import { usePagination } from '../../../hooks/usePagination';

const EnrollmentManagementPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { enrollments, loading, error } = useAppSelector((state: RootState) => state.enrollments);

  const [user] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

  const isAdmin = user?.role === 0;

  // Search & Filter
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredEnrollments = useMemo(() => {
    let result = enrollments;
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(
        (e) =>
          e.student_profile?.FullName?.toLowerCase().includes(q) ||
          e.course_section?.SectionName?.toLowerCase().includes(q) ||
          String(e.StudentID).toLowerCase().includes(q)
      );
    }
    if (filterStatus !== '') {
      result = result.filter((e) => String(e.Status) === filterStatus);
    }
    return result;
  }, [enrollments, searchText, filterStatus]);

  const pagination = usePagination(filteredEnrollments);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete'>('add');
  const [selectedRecord, setSelectedRecord] = useState<Enrollment | null>(null);
  const [flash, setFlash] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    dispatch(fetchEnrollments());
  }, [dispatch]);

  const openAddModal = () => {
    setModalMode('add');
    setSelectedRecord(null);
    setSubmitError('');
    setFlash('');
    setModalOpen(true);
  };

  const openEditModal = (record: Enrollment) => {
    setModalMode('edit');
    setSelectedRecord(record);
    setSubmitError('');
    setFlash('');
    setModalOpen(true);
  };

  const openDeleteModal = (record: Enrollment) => {
    setModalMode('delete');
    setSelectedRecord(record);
    setSubmitError('');
    setFlash('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRecord(null);
    setSubmitError('');
  };

  const handleAdd = async (data: { StudentID: string; SectionID: string }) => {
    try {
      await dispatch(createEnrollment(data)).unwrap();
      setFlash('Đăng ký học phần thành công!');
      closeModal();
    } catch (err: any) {
      setSubmitError(err || 'Có lỗi xảy ra.');
    }
  };

  const handleSaveEdit = async (data: { EnrollmentID: string; Status: number }) => {
    try {
      await dispatch(updateEnrollment({ id: data.EnrollmentID, Status: data.Status })).unwrap();
      setFlash('Cập nhật trạng thái thành công!');
      closeModal();
    } catch (err: any) {
      setSubmitError(err || 'Có lỗi xảy ra.');
    }
  };

  const handleDelete = async () => {
    if (!selectedRecord) return;
    try {
      await dispatch(deleteEnrollment(selectedRecord.EnrollmentID)).unwrap();
      setFlash('Xóa đăng ký thành công!');
      closeModal();
    } catch (err: any) {
      setSubmitError(err || 'Có lỗi xảy ra.');
    }
  };

  const modalTitle =
    modalMode === 'add'   ? 'Đăng Ký Học Phần Cho Sinh Viên' :
    modalMode === 'edit'  ? 'Cập Nhật Trạng Thái Đăng Ký' :
    modalMode === 'delete'? 'Xóa Đăng Ký' : '';

  return (
    <CrudLayout
      title="Quản Lý Đăng Ký Học Phần"
      description={
        isAdmin
          ? 'Toàn bộ danh sách đăng ký trong hệ thống'
          : 'Danh sách sinh viên đăng ký lớp học phần của bạn'
      }
      flash={flash}
      error={error || ''}
      toolbar={
        <SearchFilterBar
          searchValue={searchText}
          onSearchChange={setSearchText}
          placeholder="Tìm theo tên sinh viên, tên lớp học phần..."
          filters={[
            {
              key: 'status',
              label: 'Trạng thái',
              options: [
                { value: '1', label: 'Đã đăng ký' },
                { value: '0', label: 'Đã hủy' },
              ],
              placeholder: '-- Tất cả trạng thái --',
            },
          ]}
          filterValues={{ status: filterStatus }}
          onFilterChange={(_key, val) => setFilterStatus(val)}
          onReset={() => { setSearchText(''); setFilterStatus(''); }}
          resultCount={filteredEnrollments.length}
          totalCount={enrollments.length}
        />
      }
      pagination={
        <Pagination
          currentPage={pagination.currentPage}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          pageSizeOptions={pagination.pageSizeOptions}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
        />
      }
      action={
        isAdmin ? (
          <Button variant="primary" onClick={openAddModal}>
            <MdAdd size={20} /> Đăng ký mới
          </Button>
        ) : null
      }
    >
      <EnrollmentTable
        data={pagination.paginatedItems}
        loading={loading}
        isAdmin={isAdmin}
        onEdit={(record) => openEditModal(record)}
        onDelete={(id) => {
          const record = enrollments.find((e) => e.EnrollmentID === id);
          if (record) openDeleteModal(record);
        }}
      />

      <Modal isOpen={modalOpen} onClose={closeModal} title={modalTitle}>
        {/* ADD */}
        {modalMode === 'add' && (
          <EnrollmentAddForm
            onSave={handleAdd}
            onCancel={closeModal}
            submitError={submitError}
          />
        )}

        {/* EDIT */}
        {modalMode === 'edit' && selectedRecord && (
          <EnrollmentForm
            record={selectedRecord}
            onSave={handleSaveEdit}
            onCancel={closeModal}
            submitError={submitError}
          />
        )}

        {/* DELETE */}
        {modalMode === 'delete' && selectedRecord && (
          <div style={{ padding: '10px 0' }}>
            <p>
              Bạn có chắc muốn xóa bản đăng ký{' '}
              <strong>{selectedRecord.EnrollmentID}</strong>?
            </p>
            <p style={{ fontSize: '0.9em', color: '#555', marginTop: '6px' }}>
              Sinh viên: <strong>{selectedRecord.student_profile?.FullName || selectedRecord.StudentID}</strong>
              {' — '}
              Lớp: <strong>{selectedRecord.course_section?.SectionName || selectedRecord.SectionID}</strong>
            </p>
            {submitError && <div className="alert error" style={{ marginTop: '12px' }}>{submitError}</div>}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="ghost" onClick={closeModal}>Không</Button>
              <Button variant="danger" onClick={handleDelete}>Có, xóa</Button>
            </div>
          </div>
        )}
      </Modal>
    </CrudLayout>
  );
};

export default EnrollmentManagementPage;
