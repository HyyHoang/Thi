import React from 'react';
import { Department, StudentProfilePayload, User } from '../../../../types';

interface StudentProfileFormProps {
    values: StudentProfilePayload;
    departments: Department[];
    users: User[];
    errors: Record<string, string>;
    submitError: string;
    mode: 'create' | 'edit';
    originalUserID?: string | null;
    onChange: (field: keyof StudentProfilePayload, value: string | number) => void;
    onSubmit: () => void;
    onCancel: () => void;
}

function StudentProfileForm({
    values,
    departments,
    users,
    errors,
    submitError,
    mode,
    originalUserID,
    onChange,
    onSubmit,
    onCancel,
}: StudentProfileFormProps) {
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <form onSubmit={handleFormSubmit} className="modal-content">
            <div className="form-group">
                <label>Tài khoản (Tùy chọn)</label>
                <select
                    className={`form-control ${errors.UserID ? 'error' : ''}`}
                    value={values.UserID || ''}
                    onChange={(e) => onChange('UserID', e.target.value)}
                    disabled={mode === 'edit' && !!originalUserID}
                >
                    <option value="">-- Không chọn tài khoản --</option>
                    {users.map((u) => (
                        <option key={u.user_id} value={u.user_id}>
                            {u.username || u.Username} {u.email || u.Email ? `(${u.email || u.Email})` : ''}
                        </option>
                    ))}
                </select>
                {mode === 'edit' && !!originalUserID && (
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                        Sinh viên đã có tài khoản, không thể thay đổi.
                    </span>
                )}
                {errors.UserID && <span className="error-msg">{errors.UserID}</span>}
            </div>

            <div className="form-group">
                <label>Họ tên *</label>
                <input
                    type="text"
                    className={`form-control ${errors.FullName ? 'error' : ''}`}
                    value={values.FullName}
                    onChange={(e) => onChange('FullName', e.target.value)}
                    required
                />
                {errors.FullName && <span className="error-msg">{errors.FullName}</span>}
            </div>

            <div className="form-group">
                <label>Khoa (Tùy chọn)</label>
                <select
                    className={`form-control ${errors.DepartmentID ? 'error' : ''}`}
                    value={values.DepartmentID || ''}
                    onChange={(e) => onChange('DepartmentID', e.target.value)}
                >
                    <option value="">-- Chọn khoa --</option>
                    {departments.map((d) => (
                        <option key={d.department_id} value={d.department_id}>
                            {d.department_name || d.DepartmentName}
                        </option>
                    ))}
                </select>
                {errors.DepartmentID && <span className="error-msg">{errors.DepartmentID}</span>}
            </div>

            <div className="form-group">
                <label>Năm nhập học *</label>
                <input
                    type="number"
                    className={`form-control ${errors.EnrollmentYear ? 'error' : ''}`}
                    value={values.EnrollmentYear}
                    onChange={(e) => onChange('EnrollmentYear', parseInt(e.target.value, 10))}
                    required
                    max={new Date().getFullYear()}
                />
                {errors.EnrollmentYear && <span className="error-msg">{errors.EnrollmentYear}</span>}
            </div>

            <div className="form-group">
                <label>Trạng thái *</label>
                <select
                    className={`form-control ${errors.Status ? 'error' : ''}`}
                    value={values.Status}
                    onChange={(e) => onChange('Status', parseInt(e.target.value, 10))}
                    required
                >
                    <option value={1}>Đang học</option>
                    <option value={2}>Bảo lưu</option>
                    <option value={3}>Bỏ học</option>
                </select>
                {errors.Status && <span className="error-msg">{errors.Status}</span>}
            </div>

            {submitError && <div className="alert error">{submitError}</div>}

            <div className="modal-actions">
                <button type="button" className="ghost-btn" onClick={onCancel}>
                    Hủy
                </button>
                <button type="submit" className="primary-btn">
                    {mode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
                </button>
            </div>
        </form>
    );
}

export default StudentProfileForm;
