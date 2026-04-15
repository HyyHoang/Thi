import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../lib/store/redux/hooks';
import { fetchExamAttempts, createExamAttempt, updateExamAttempt, deleteExamAttempt } from '../redux/examAttemptThunks';
import {
  selectExamAttempts,
  selectExamAttemptsError,
  selectExamAttemptsLoading,
} from '../redux/examAttemptSelectors';
import { clearExamAttemptError } from '../redux/examAttemptSlice';
import { ExamAttempt, ExamAttemptPayload } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { CrudLayout } from '../../../components/layout/CrudLayout';
import { MdAdd, MdWarningAmber } from 'react-icons/md';
import ExamAttemptTable from '../components/ExamAttemptTable';
import ExamAttemptForm from '../components/ExamAttemptForm';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { Pagination } from '../../../components/ui/Pagination';
import { usePagination } from '../../../hooks/usePagination';
import { fetchResultByAttempt, clearSelectedResult } from '../../results/redux/resultsSlice';
import ResultDetailModal from '../../results/components/ResultDetailModal';

type ModalMode = 'create' | 'edit' | 'view' | 'delete' | 'view_result';

const emptyForm: ExamAttemptPayload = {
  exam_id: '',
  student_id: '',
  status: 'in_progress',
  submit_time: '',
  ip_address: '',
};

function ExamAttemptList() {
  const dispatch = useAppDispatch();
  const attempts = useAppSelector(selectExamAttempts);
  const loading = useAppSelector(selectExamAttemptsLoading);
  const error = useAppSelector(selectExamAttemptsError) || '';

  const { selected: selectedResult, loading: resultLoading, error: resultError } = useAppSelector((state) => state.results);

  const [flash, setFlash] = useState('');

  // Search & Filter
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredAttempts = useMemo(() => {
    let result = attempts || [];
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(
        (a) =>
          a.exam_title?.toLowerCase().includes(q) ||
          a.student_name?.toLowerCase().includes(q) ||
          a.exam_id?.toLowerCase().includes(q) ||
          a.student_id?.toLowerCase().includes(q)
      );
    }
    if (filterStatus) {
      result = result.filter((a) => a.status === filterStatus);
    }
    return result;
  }, [attempts, searchText, filterStatus]);

  const pagination = usePagination(filteredAttempts, 10);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [selectedAttempt, setSelectedAttempt] = useState<ExamAttempt | null>(null);
  const [formData, setFormData] = useState<ExamAttemptPayload>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const canEdit = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      return user?.role === 0; // Admin can modify attempts
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    dispatch(fetchExamAttempts());
  }, [dispatch]);

  const openModal = (mode: ModalMode, attempt: ExamAttempt | null = null) => {
    setModalMode(mode);
    setSelectedAttempt(attempt);
    setSubmitError('');
    setFormErrors({});
    setFlash('');
    dispatch(clearExamAttemptError());

    if (mode === 'create') {
      setFormData(emptyForm);
    } else if (attempt) {
      setFormData({
        status: attempt.status,
        submit_time: attempt.submit_time || '',
        ip_address: attempt.ip_address || '',
      });
    }
    setModalOpen(true);
  };

  const openViewResultModal = (attempt: ExamAttempt) => {
    dispatch(clearSelectedResult());
    setModalMode('view_result');
    setSelectedAttempt(attempt);
    setSubmitError('');
    setFormErrors({});
    setFlash('');
    setModalOpen(true);
    dispatch(fetchResultByAttempt(attempt.attempt_id));
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedAttempt(null);
    setSubmitError('');
    setFormErrors({});
  };

  const handleFormChange = (field: string | number | symbol, value: string) => {
    setFormData((prev) => ({ ...prev, [field as string]: value }));
    setFormErrors((prev) => ({ ...prev, [field as string]: '' }));
  };

  const handleSubmit = async () => {
    setSubmitError('');

    try {
      if (modalMode === 'create') {
        await dispatch(createExamAttempt(formData)).unwrap();
        setFlash('Ghi nhận lượt làm bài thành công');
      } else if (modalMode === 'edit' && selectedAttempt) {
        // format datetime to match what backend might expect if it's set
        const payload: ExamAttemptPayload = {
          status: formData.status,
          submit_time: formData.submit_time || undefined,
          ip_address: formData.ip_address || undefined,
        };
        await dispatch(updateExamAttempt({ id: selectedAttempt.attempt_id, payload })).unwrap();
        setFlash('Cập nhật lượt làm bài thành công');
      }
      closeModal();
      dispatch(fetchExamAttempts());
    } catch (err: any) {
      let emsg = typeof err === 'string' ? err : 'Có lỗi xảy ra, vui lòng thử lại.';
      if (err?.errors) {
        setFormErrors(err.errors);
      }
      setSubmitError(emsg);
    }
  };

  const handleDelete = async (attempt: ExamAttempt) => {
    setSubmitError('');
    setFlash('');
    try {
      await dispatch(deleteExamAttempt(attempt.attempt_id)).unwrap();
      setFlash('Xóa lượt làm bài thành công');
      closeModal();
      dispatch(fetchExamAttempts());
    } catch (err: any) {
      setSubmitError(typeof err === 'string' ? err : 'Không thể xóa lượt làm bài.');
    }
  };

  const statusFilterOptions = [
    { value: 'in_progress', label: 'Đang làm' },
    { value: 'submitted', label: 'Đã nộp bài' },
    { value: 'expired', label: 'Hết hạn' },
  ];

  return (
    <CrudLayout
      title="Quản lý lượt làm bài"
      description="Danh sách quá trình và kết quả làm bài thi của sinh viên"
      flash={flash}
      error={error}
      toolbar={
        <SearchFilterBar
          searchValue={searchText}
          onSearchChange={setSearchText}
          placeholder="Tìm sinh viên, đề thi..."
          filters={[
            {
              key: 'status',
              label: 'Trạng thái',
              options: statusFilterOptions,
              placeholder: '-- Tất cả --',
            },
          ]}
          filterValues={{ status: filterStatus }}
          onFilterChange={(_key, val) => setFilterStatus(val)}
          onReset={() => {
            setSearchText('');
            setFilterStatus('');
          }}
          resultCount={filteredAttempts.length}
          totalCount={attempts?.length || 0}
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
        canEdit ? (
          <Button variant="primary" onClick={() => openModal('create')}>
            <MdAdd size={20} /> Ghi nhận thủ công
          </Button>
        ) : null
      }
    >
      <ExamAttemptTable
        attempts={pagination.paginatedItems}
        loading={loading}
        canEdit={canEdit}
        onView={(a) => openModal('view', a)}
        onViewResult={openViewResultModal}
        onEdit={(a) => openModal('edit', a)}
        onDelete={(a) => openModal('delete', a)}
      />

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        size={modalMode === 'view_result' ? 'xl' : 'md'}
        title={
          modalMode === 'create' ? 'Tạo lượt làm bài' :
          modalMode === 'edit' ? 'Cập nhật trạng thái' :
          modalMode === 'view' ? 'Chi tiết lượt làm bài' :
          modalMode === 'delete' ? 'Xóa lượt làm bài' :
          modalMode === 'view_result' ? 'Chi tiết bài làm' : ''
        }
      >
        {(modalMode === 'create' || modalMode === 'edit') && (
          <ExamAttemptForm
            values={formData}
            errors={formErrors}
            submitError={submitError}
            mode={modalMode}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            onCancel={closeModal}
          />
        )}

        {modalMode === 'view' && selectedAttempt && (
          <div style={{ padding: '10px 0', lineHeight: '1.6' }}>
            <p><strong>ID Lượt thi:</strong> {selectedAttempt.attempt_id}</p>
            <p><strong>Mã đề:</strong> {selectedAttempt.exam_id}</p>
            <p><strong>Đề thi:</strong> {selectedAttempt.exam_title || '-'}</p>
            <p><strong>Học phần:</strong> {selectedAttempt.subject_name || '-'}</p>
            <p><strong>Sinh viên:</strong> {selectedAttempt.student_name} ({selectedAttempt.student_id})</p>
            <p><strong>Bắt đầu lúc:</strong> {selectedAttempt.start_time}</p>
            <p><strong>Nộp bài lúc:</strong> {selectedAttempt.submit_time || 'Chưa nộp'}</p>
            <p>
              <strong>Trạng thái:</strong>{' '}
              {selectedAttempt.status === 'in_progress' ? 'Đang làm' :
               selectedAttempt.status === 'submitted' ? 'Đã nộp bài' : 'Hết hạn'}
            </p>
            <p><strong>IP Truy cập:</strong> {selectedAttempt.ip_address || 'N/A'}</p>
            
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" onClick={closeModal}>Đóng</Button>
            </div>
          </div>
        )}

        {modalMode === 'delete' && selectedAttempt && (
          <div style={{ padding: '10px 0' }}>
            <p>
              Bạn có chắc muốn xóa lượt làm bài của sinh viên{' '}
              <strong>{selectedAttempt.student_name}</strong> thi đề{' '}
              <strong>{selectedAttempt.exam_title || selectedAttempt.exam_id}</strong>?
            </p>
            <p className="text-danger">
              <small>Hành động này sẽ xóa vĩnh viễn dữ liệu kết quả, bài nộp của sinh viên.</small>
            </p>
            {submitError && (
              <div className="alert error">
                <MdWarningAmber size={20} /> {submitError}
              </div>
            )}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="ghost" onClick={closeModal}>Không</Button>
              <Button variant="danger" onClick={() => handleDelete(selectedAttempt)}>Có, xóa</Button>
            </div>
          </div>
        )}

        {modalMode === 'view_result' && (
          <div>
            {resultLoading ? (
               <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải hệ thống...</div>
            ) : resultError ? (
               <div style={{ padding: '20px', textAlign: 'center', color: '#dc2626' }}>
                  <MdWarningAmber size={24} style={{ marginBottom: 10 }} />
                  <p>{resultError}</p>
               </div>
            ) : selectedResult ? (
               <ResultDetailModal result={selectedResult} onClose={closeModal} />
            ) : null}
          </div>
        )}
      </Modal>
    </CrudLayout>
  );
}

export default ExamAttemptList;
