import React from 'react';
import { TeacherProfilePayload, Department, User } from '../../../../types';

interface TeacherProfileFormProps {
    values: TeacherProfilePayload;
    departments: Department[];
    users: User[];
    errors: Record<string, string>;
    submitError?: string;
    mode: 'create' | 'edit';
    onChange: (field: keyof TeacherProfilePayload, value: string | number) => void;
    onSubmit: () => void;
    onCancel: () => void;
}

function TeacherProfileForm({
    values,
    departments,
    users,
    errors,
    submitError,
    mode,
    onChange,
    onSubmit,
    onCancel,
}: TeacherProfileFormProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <form onSubmit={handleSubmit} className="modal-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxHeight: '70vh', overflowY: 'auto', paddingRight: '1rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
               {submitError && <div className="alert error">{submitError}</div>}
            </div>

            <label>
                Tài khoản liên kết *
                <select
                    name="user_id"
                    value={values.user_id || ''}
                    onChange={(e) => onChange('user_id', e.target.value)}
                >
                    <option value="">-- Chọn tài khoản --</option>
                    {users.map((u) => (
                        <option key={u.user_id} value={u.user_id}>
                            {u.email} ({u.username})
                        </option>
                    ))}
                </select>
                {errors.user_id && <span className="field-error">{errors.user_id}</span>}
            </label>

            <label>
                Khoa quản lý *
                <select
                    name="department_id"
                    value={values.department_id || ''}
                    onChange={(e) => onChange('department_id', e.target.value)}
                >
                    <option value="">-- Chọn khoa --</option>
                    {departments.map((d) => (
                        <option key={d.department_id} value={d.department_id}>
                            {d.department_name}
                        </option>
                    ))}
                </select>
                {errors.department_id && <span className="field-error">{errors.department_id}</span>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
                Họ và tên *
                <input
                    type="text"
                    name="full_name"
                    value={values.full_name || ''}
                    onChange={(e) => onChange('full_name', e.target.value)}
                />
                {errors.full_name && <span className="field-error">{errors.full_name}</span>}
            </label>

            <label>
                Giới tính
                <select
                    name="gender"
                    value={values.gender || ''}
                    onChange={(e) => onChange('gender', e.target.value)}
                >
                    <option value="">-- Chọn giới tính --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                </select>
                {errors.gender && <span className="field-error">{errors.gender}</span>}
            </label>

            <label>
                Ngày sinh
                <input
                    type="date"
                    name="birth_date"
                    value={values.birth_date || ''}
                    onChange={(e) => onChange('birth_date', e.target.value)}
                />
                {errors.birth_date && <span className="field-error">{errors.birth_date}</span>}
            </label>

            <label>
                Số điện thoại
                <input
                    type="text"
                    name="phone"
                    value={values.phone || ''}
                    onChange={(e) => onChange('phone', e.target.value)}
                />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
            </label>

            <label>
                Bằng cấp
                <input
                    type="text"
                    name="degree"
                    value={values.degree || ''}
                    onChange={(e) => onChange('degree', e.target.value)}
                    placeholder="VD: Thạc sĩ, Tiến sĩ"
                />
                {errors.degree && <span className="field-error">{errors.degree}</span>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
                Chức danh / Học hàm
                <input
                    type="text"
                    name="academic_rank"
                    value={values.academic_rank || ''}
                    onChange={(e) => onChange('academic_rank', e.target.value)}
                    placeholder="VD: Giáo sư, Phó giáo sư"
                />
                {errors.academic_rank && <span className="field-error">{errors.academic_rank}</span>}
            </label>

            <div className="modal-actions" style={{ gridColumn: '1 / -1' }}>
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

export default TeacherProfileForm;
