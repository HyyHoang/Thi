import React from 'react';
import { UserPayload } from '../../../../types';

interface UserFormProps {
    values: UserPayload;
    errors: Record<string, string>;
    submitError?: string;
    mode: 'create' | 'edit';
    onChange: (field: keyof UserPayload, value: string | number) => void;
    onSubmit: () => void;
    onCancel: () => void;
}

const ROLE_OPTIONS = [
    { value: 0, label: 'Admin' },
    { value: 1, label: 'Teacher' },
    { value: 2, label: 'Student' },
];

function UserForm({
    values,
    errors,
    submitError,
    mode,
    onChange,
    onSubmit,
    onCancel,
}: UserFormProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <form onSubmit={handleSubmit} className="modal-form">
            {submitError && <div className="alert error">{submitError}</div>}

            <label>
                Username
                <input
                    type="text"
                    name="username"
                    value={values.username || ''}
                    onChange={(e) => onChange('username', e.target.value)}
                />
                {errors.username && <span className="field-error">{errors.username}</span>}
            </label>

            <label>
                Password {mode === 'edit' && '(để trống nếu không đổi)'}
                <input
                    type="password"
                    name="password"
                    value={values.password || ''}
                    onChange={(e) => onChange('password', e.target.value)}
                />
                {errors.password && <span className="field-error">{errors.password}</span>}
            </label>

            <label>
                Email
                <input
                    type="email"
                    name="email"
                    value={values.email || ''}
                    onChange={(e) => onChange('email', e.target.value)}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
            </label>

            <label>
                AVT
                <input
                    type="text"
                    name="avt"
                    value={values.avt || ''}
                    onChange={(e) => onChange('avt', e.target.value)}
                    placeholder="Link ảnh đại diện"
                />
                {errors.avt && <span className="field-error">{errors.avt}</span>}
            </label>

            <label>
                Role
                <select
                    name="role"
                    value={values.role ?? 2}
                    onChange={(e) => onChange('role', Number(e.target.value))}
                >
                    {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {errors.role && <span className="field-error">{errors.role}</span>}
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

export default UserForm;
