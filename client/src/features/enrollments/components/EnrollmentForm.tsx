import React, { useState, useEffect } from 'react';
import { Enrollment } from '../types';
import { Button } from '../../../components/ui/Button';

interface FormProps {
  record?: Enrollment | null;
  onSave: (data: { EnrollmentID: string; Status: number }) => void;
  onCancel: () => void;
  submitError?: string;
}

const EnrollmentForm: React.FC<FormProps> = ({ record, onSave, onCancel, submitError }) => {
  const [status, setStatus] = useState<number>(1);

  useEffect(() => {
    if (record) {
      setStatus(record.Status);
    }
  }, [record]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (record) {
      onSave({ EnrollmentID: record.EnrollmentID, Status: status });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '12px', fontSize: '0.9em', color: '#555' }}>
        <p><strong>Mã đăng ký:</strong> {record?.EnrollmentID}</p>
        <p style={{ marginTop: '4px' }}><strong>Sinh viên:</strong> {record?.student_profile?.FullName || record?.StudentID}</p>
        <p style={{ marginTop: '4px' }}><strong>Lớp:</strong> {record?.course_section?.SectionName || record?.SectionID}</p>
      </div>

      <div className="form-group" style={{ marginTop: '16px' }}>
        <label>Trạng Thái</label>
        <select
          value={status}
          onChange={(e) => setStatus(Number(e.target.value))}
          className="form-control"
        >
          <option value={1}>Đã đăng ký</option>
          <option value={0}>Đã hủy</option>
        </select>
      </div>

      {submitError && (
        <div className="alert error" style={{ marginTop: '12px' }}>{submitError}</div>
      )}

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <Button type="button" variant="ghost" onClick={onCancel}>Hủy</Button>
        <Button type="submit" variant="primary">Lưu</Button>
      </div>
    </form>
  );
};

export default EnrollmentForm;
