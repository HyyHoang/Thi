import React from 'react';
import { CourseSectionPayload, Subject, Semester, TeacherProfile } from '../../../../types';

interface CourseSectionFormProps {
    values: CourseSectionPayload;
    subjects: Subject[];
    semesters: Semester[];
    teachers: TeacherProfile[];
    errors: Record<string, string>;
    submitError?: string;
    mode: 'create' | 'edit';
    onChange: (field: keyof CourseSectionPayload, value: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
}

function CourseSectionForm({
    values,
    subjects,
    semesters,
    teachers,
    errors,
    submitError,
    mode,
    onChange,
    onSubmit,
    onCancel,
}: CourseSectionFormProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <form onSubmit={handleSubmit} className="modal-form">
            {submitError && <div className="alert error">{submitError}</div>}

            <label>
                Tên lớp học phần
                <input
                    type="text"
                    name="SectionName"
                    value={values.SectionName}
                    onChange={(e) => onChange('SectionName', e.target.value)}
                />
                {errors.SectionName && (
                    <span className="field-error">{errors.SectionName}</span>
                )}
            </label>

            <label>
                Môn học
                <select
                    name="SubjectID"
                    value={values.SubjectID}
                    onChange={(e) => onChange('SubjectID', e.target.value)}
                >
                    <option value="">-- Chọn môn học --</option>
                    {subjects.map((sub) => (
                        <option key={sub.SubjectID} value={sub.SubjectID}>
                            {sub.SubjectName}
                        </option>
                    ))}
                </select>
                {errors.SubjectID && <span className="field-error">{errors.SubjectID}</span>}
            </label>

            <label>
                Học kỳ
                <select
                    name="SemesterID"
                    value={values.SemesterID}
                    onChange={(e) => onChange('SemesterID', e.target.value)}
                >
                    <option value="">-- Chọn học kỳ --</option>
                    {semesters.map((sem) => (
                        <option key={sem.semester_id} value={sem.semester_id}>
                            {sem.semester_name} - {sem.academic_year}
                        </option>
                    ))}
                </select>
                {errors.SemesterID && <span className="field-error">{errors.SemesterID}</span>}
            </label>

            <label>
                Giảng viên
                <select
                    name="TeacherID"
                    value={values.TeacherID}
                    onChange={(e) => onChange('TeacherID', e.target.value)}
                >
                    <option value="">-- Chọn giảng viên --</option>
                    {teachers.map((tea) => (
                        <option key={tea.teacher_id} value={tea.teacher_id}>
                            {tea.full_name} ({tea.teacher_id})
                        </option>
                    ))}
                </select>
                {errors.TeacherID && <span className="field-error">{errors.TeacherID}</span>}
            </label>

            <label>
                Sĩ số tối đa
                <input
                    type="number"
                    name="MaxStudent"
                    value={values.MaxStudent}
                    min={1}
                    onChange={(e) => onChange('MaxStudent', e.target.value)}
                />
                {errors.MaxStudent && (
                    <span className="field-error">{errors.MaxStudent}</span>
                )}
            </label>

            <div className="modal-actions">
                <button type="button" className="ghost-btn" onClick={onCancel}>
                    Hủy
                </button>
                <button type="submit" className="primary-btn">
                    {mode === 'create' ? 'Lưu' : 'Cập nhật'}
                </button>
            </div>
        </form>
    );
}

export default CourseSectionForm;
