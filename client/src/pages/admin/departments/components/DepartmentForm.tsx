import React from 'react';
import { DepartmentPayload, Institute } from '../../../../types';

interface DepartmentFormProps {
    values: DepartmentPayload & { institute_id: number | string };
    institutes: Institute[];
    errors: Record<string, string>;
    submitError?: string;
    mode: 'create' | 'edit';
    onChange: (field: keyof DepartmentPayload, value: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
}

function DepartmentForm({
    values,
    institutes,
    errors,
    submitError,
    mode,
    onChange,
    onSubmit,
    onCancel,
}: DepartmentFormProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <form onSubmit={handleSubmit} className="modal-form">
            {submitError && <div className="alert error">{submitError}</div>}

            <label>
                Tên khoa
                <input
                    type="text"
                    name="department_name"
                    value={values.department_name}
                    onChange={(e) => onChange('department_name', e.target.value)}
                />
                {errors.department_name && (
                    <span className="field-error">{errors.department_name}</span>
                )}
            </label>

            <label>
                Viện
                <select
                    name="institute_id"
                    value={values.institute_id}
                    onChange={(e) => onChange('institute_id', e.target.value)}
                >
                    <option value="">-- Chọn viện --</option>
                    {institutes.map((inst) => (
                        <option key={inst.institute_id} value={String(inst.institute_id)}>
                            {inst.institute_name}
                        </option>
                    ))}
                </select>
                {errors.institute_id && <span className="field-error">{errors.institute_id}</span>}
            </label>

            <label>
                Mô tả
                <textarea
                    name="description"
                    rows={4}
                    value={values.description || ''}
                    onChange={(e) => onChange('description', e.target.value)}
                />
                {errors.description && <span className="field-error">{errors.description}</span>}
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

export default DepartmentForm;

