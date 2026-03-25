import React from 'react';
import { SemesterPayload } from '../../../../types';

interface SemesterFormProps {
    values: SemesterPayload;
    errors: Record<string, string>;
    submitError?: string;
    mode: 'create' | 'edit';
    onChange: (field: keyof SemesterPayload, value: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
}

function SemesterForm({
    values,
    errors,
    submitError,
    mode,
    onChange,
    onSubmit,
    onCancel,
}: SemesterFormProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <form onSubmit={handleSubmit} className="modal-form">
            {submitError && <div className="alert error">{submitError}</div>}

            <label>
                Tên học kỳ
                <input
                    type="text"
                    name="semester_name"
                    value={values.semester_name}
                    onChange={(e) => onChange('semester_name', e.target.value)}
                />
                {errors.semester_name && <span className="field-error">{errors.semester_name}</span>}
            </label>

            <label>
                Năm học
                <input
                    type="text"
                    name="academic_year"
                    placeholder="VD: 2025-2026"
                    value={values.academic_year}
                    onChange={(e) => onChange('academic_year', e.target.value)}
                />
                {errors.academic_year && <span className="field-error">{errors.academic_year}</span>}
            </label>

            <label>
                Ngày bắt đầu
                <input
                    type="date"
                    name="start_date"
                    value={values.start_date}
                    onChange={(e) => onChange('start_date', e.target.value)}
                />
                {errors.start_date && <span className="field-error">{errors.start_date}</span>}
            </label>

            <label>
                Ngày kết thúc
                <input
                    type="date"
                    name="end_date"
                    value={values.end_date}
                    onChange={(e) => onChange('end_date', e.target.value)}
                />
                {errors.end_date && <span className="field-error">{errors.end_date}</span>}
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

export default SemesterForm;
