import React from 'react';
import { SubjectPayload, Department } from '../../../../types';

interface SubjectFormProps {
    values: SubjectPayload & { DepartmentID: number | string };
    departments: Department[];
    errors: Record<string, string>;
    submitError?: string;
    mode: 'create' | 'edit';
    onChange: (field: keyof SubjectPayload, value: string | number) => void;
    onSubmit: () => void;
    onCancel: () => void;
}

function SubjectForm({
    values,
    departments,
    errors,
    submitError,
    mode,
    onChange,
    onSubmit,
    onCancel,
}: SubjectFormProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <form onSubmit={handleSubmit} className="modal-form">
            {submitError && <div className="alert error">{submitError}</div>}

            <label>
                Tên môn học <span style={{ color: 'red' }}>*</span>
                <input
                    type="text"
                    name="SubjectName"
                    value={values.SubjectName}
                    required
                    onChange={(e) => onChange('SubjectName', e.target.value)}
                />
                {errors.SubjectName && (
                    <span className="field-error">{errors.SubjectName}</span>
                )}
            </label>

            <label>
                Khoa quản lý <span style={{ color: 'red' }}>*</span>
                <select
                    name="DepartmentID"
                    value={values.DepartmentID}
                    required
                    onChange={(e) => onChange('DepartmentID', e.target.value)}
                >
                    <option value="">-- Chọn khoa --</option>
                    {departments.map((dep) => (
                        <option key={dep.department_id} value={String(dep.department_id)}>
                            {dep.department_name}
                        </option>
                    ))}
                </select>
                {errors.DepartmentID && <span className="field-error">{errors.DepartmentID}</span>}
            </label>

            <label>
                Số tín chỉ <span style={{ color: 'red' }}>*</span>
                <input
                    type="number"
                    name="Credit"
                    min="1"
                    max="12"
                    required
                    value={values.Credit}
                    onChange={(e) => onChange('Credit', e.target.value)}
                />
                {errors.Credit && (
                    <span className="field-error">{errors.Credit}</span>
                )}
            </label>

            <label>
                Mô tả
                <textarea
                    name="Description"
                    rows={4}
                    value={values.Description || ''}
                    onChange={(e) => onChange('Description', e.target.value)}
                />
                {errors.Description && <span className="field-error">{errors.Description}</span>}
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

export default SubjectForm;
