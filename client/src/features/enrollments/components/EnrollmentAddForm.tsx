import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../lib/store/redux/hooks';
import { RootState } from '../../../lib/store/redux/store';
import { fetchStudentProfiles } from '../../student-profiles/redux/studentProfileThunks';
import { fetchCourseSections } from '../../course-sections/courseSectionSlice';
import { Button } from '../../../components/ui/Button';

interface AddFormProps {
  onSave: (data: { StudentID: string; SectionID: string }) => void;
  onCancel: () => void;
  submitError?: string;
}

const EnrollmentAddForm: React.FC<AddFormProps> = ({ onSave, onCancel, submitError }) => {
  const dispatch = useAppDispatch();
  const students = useAppSelector((state: RootState) => state.studentProfiles.items);
  const sections = useAppSelector((state: RootState) => state.courseSections.items);

  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (students.length === 0) dispatch(fetchStudentProfiles());
    if (sections.length === 0) dispatch(fetchCourseSections());
  }, [dispatch, students.length, sections.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!selectedStudent || !selectedSection) {
      setLocalError('Vui lòng chọn đầy đủ Sinh viên và Lớp học phần.');
      return;
    }
    onSave({ StudentID: selectedStudent, SectionID: selectedSection });
  };

  const errorMsg = submitError || localError;

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Sinh Viên</label>
        <select
          value={selectedStudent}
          onChange={(e) => { setSelectedStudent(e.target.value); setLocalError(''); }}
          className="form-control"
          required
        >
          <option value="">-- Chọn Sinh Viên --</option>
          {students.map(s => (
            <option key={s.StudentID} value={s.StudentID}>
              [{s.StudentID}] {s.FullName}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group" style={{ marginTop: '16px' }}>
        <label>Lớp Học Phần</label>
        <select
          value={selectedSection}
          onChange={(e) => { setSelectedSection(e.target.value); setLocalError(''); }}
          className="form-control"
          required
        >
          <option value="">-- Chọn Lớp Học Phần --</option>
          {sections.map(sec => (
            <option key={sec.SectionID} value={sec.SectionID}>
              [{sec.SectionID}] {sec.SectionName} - {sec.Subject?.SubjectName}
            </option>
          ))}
        </select>
      </div>

      {errorMsg && (
        <div className="alert error" style={{ marginTop: '12px' }}>{errorMsg}</div>
      )}

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <Button type="button" variant="ghost" onClick={onCancel}>Hủy</Button>
        <Button type="submit" variant="primary">Đăng Ký</Button>
      </div>
    </form>
  );
};

export default EnrollmentAddForm;
