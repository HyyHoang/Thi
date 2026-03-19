import React from 'react';
import { InstitutePayload } from '../../../../types';

interface InstituteFormProps {
    values: InstitutePayload;
    errors: Record<string, string>;
    submitError?: string;
    mode: 'create' | 'edit';
    onChange: (field: keyof InstitutePayload, value: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
}

function InstituteForm({
    values,
    errors,
    submitError,
    mode,
    onChange,
    onSubmit,
    onCancel,
}: InstituteFormProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <form onSubmit={handleSubmit} className="modal-form">
            {submitError && <div className="alert error">{submitError}</div>}

            <label>
                Tên viện
                <input
                    type="text"
                    name="institute_name"
                    value={values.institute_name}
                    onChange={(e) => onChange('institute_name', e.target.value)}
                />
                {errors.institute_name && (
                    <span className="field-error">{errors.institute_name}</span>
                )}
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

export default InstituteForm;
