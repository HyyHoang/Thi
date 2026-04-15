import React from 'react';
import { ExamAttemptPayload } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { MdWarningAmber } from 'react-icons/md';

interface ExamAttemptFormProps {
  values: ExamAttemptPayload;
  errors: Record<string, string>;
  submitError: string;
  mode: 'create' | 'edit';
  onChange: (field: string | number | symbol, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const statusOptions = [
  { value: 'in_progress', label: 'Đang làm' },
  { value: 'submitted', label: 'Đã nộp bài' },
  { value: 'expired', label: 'Hết hạn' },
];

function ExamAttemptForm({
  values,
  errors,
  submitError,
  mode,
  onChange,
  onSubmit,
  onCancel,
}: ExamAttemptFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      {submitError && (
        <div className="alert error">
          <MdWarningAmber size={20} /> {submitError}
        </div>
      )}

      {mode === 'create' && (
        <>
          <label>
            Mã đề thi <span className="text-danger">*</span>
            <input
              type="text"
              name="exam_id"
              value={values.exam_id || ''}
              onChange={(e) => onChange('exam_id', e.target.value)}
              placeholder="Nhập mã đề thi (ExamID)"
            />
            {errors.exam_id && <span className="field-error">{errors.exam_id}</span>}
          </label>

          <label>
            Mã sinh viên <span className="text-danger">*</span>
            <input
              type="text"
              name="student_id"
              value={values.student_id || ''}
              onChange={(e) => onChange('student_id', e.target.value)}
              placeholder="Nhập mã sinh viên (StudentID)"
            />
            {errors.student_id && <span className="field-error">{errors.student_id}</span>}
          </label>
        </>
      )}

      <label>
        Trạng thái
        <select
          name="status"
          value={values.status || 'in_progress'}
          onChange={(e) => onChange('status', e.target.value)}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.status && <span className="field-error">{errors.status}</span>}
      </label>

      <label>
        Thời gian nộp bài
        <input
          type="datetime-local"
          name="submit_time"
          value={values.submit_time || ''}
          onChange={(e) => onChange('submit_time', e.target.value)}
          step="1"
        />
        {errors.submit_time && <span className="field-error">{errors.submit_time}</span>}
      </label>

      <label>
        IP Address
        <input
          type="text"
          name="ip_address"
          value={values.ip_address || ''}
          onChange={(e) => onChange('ip_address', e.target.value)}
          placeholder="Ví dụ: 192.168.1.1"
        />
        {errors.ip_address && <span className="field-error">{errors.ip_address}</span>}
      </label>

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" variant="primary">
          Lưu lượt làm bài
        </Button>
      </div>
    </form>
  );
}

export default ExamAttemptForm;
