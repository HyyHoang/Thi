import React, { useEffect, useState } from 'react';
import teacherProfileService from '../../../services/teacherProfileService';
import { TeacherProfilePayload, TeacherProfile } from '../../../types';
import './MyProfile.css';

function MyProfile() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');
  
  const [formData, setFormData] = useState<Partial<TeacherProfilePayload>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await teacherProfileService.getMyProfile();
      setProfile(resp.data);
      setFormData({
        gender: resp.data.gender || '',
        birth_date: resp.data.birth_date || '',
        phone: resp.data.phone || '',
        avt: resp.data.user?.avt || '',
      });
    } catch (err: any) {
      if (err.response?.status === 404) {
          setError('Bạn chưa có hồ sơ giảng viên. Vui lòng liên hệ Admin để tạo mới.');
      } else {
          setError(err.response?.data?.message || 'Không thể tải hồ sơ.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (field: keyof TeacherProfilePayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFlash('');
    setFormErrors({});
    setSubmitting(true);
    try {
      await teacherProfileService.updateMyProfile(formData as TeacherProfilePayload);
      setFlash('Cập nhật hồ sơ thành công.');
      loadProfile(); // Reload to get fresh data
    } catch (err: any) {
      const apiErrors = err.response?.data?.errors || {};
      if (Object.keys(apiErrors).length > 0) {
        const mapped: Record<string, string> = {};
        Object.keys(apiErrors).forEach((key) => {
          mapped[key] = apiErrors[key]?.[0] || '';
        });
        setFormErrors(mapped);
      } else {
          setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !profile) {
    return (
        <div className="my-profile-page">
            <p>Đang tải dữ liệu...</p>
        </div>
    );
  }

  return (
    <div className="my-profile-page">
      <div className="my-profile-header">
        <h2>Hồ sơ cá nhân</h2>
        <p>Xem và cập nhật thông tin giảng viên của bạn</p>
      </div>

      {flash && <div className="alert success">{flash}</div>}
      {error && <div className="alert error">{error}</div>}

      {profile && (
        <form className="my-profile-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="section-title">Thông tin cơ bản (Chỉ xem)</h3>
            
            <label>
              Họ và tên
              <input type="text" value={profile.full_name || ''} readOnly disabled />
            </label>

            <label>
              Khoa
              <input type="text" value={profile.department?.department_name || '-'} readOnly disabled />
            </label>

            <label>
              Tài khoản (Email)
              <input type="text" value={profile.user?.email || '-'} readOnly disabled />
            </label>

            <label>
              Bằng cấp
              <input type="text" value={profile.degree || '-'} readOnly disabled />
            </label>

            <label>
              Chức danh / Học hàm
              <input type="text" value={profile.academic_rank || '-'} readOnly disabled />
            </label>
            
            <label>
              Ngày tạo hồ sơ
              <input type="text" value={profile.created_date ? new Date(profile.created_date).toLocaleString('vi-VN') : '-'} readOnly disabled />
            </label>
          </div>

          <div className="form-section">
            <h3 className="section-title">Thông tin chi tiết</h3>
            
            <label>
              Giới tính
              <select
                  value={formData.gender || ''}
                  onChange={(e) => handleChange('gender', e.target.value)}
              >
                  <option value="">-- Chọn giới tính --</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
              </select>
              {formErrors.gender && <span className="field-error">{formErrors.gender}</span>}
            </label>

            <label>
              Ngày sinh
              <input
                  type="date"
                  value={formData.birth_date || ''}
                  onChange={(e) => handleChange('birth_date', e.target.value)}
              />
              {formErrors.birth_date && <span className="field-error">{formErrors.birth_date}</span>}
            </label>

            <label>
              Số điện thoại
              <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
              />
              {formErrors.phone && <span className="field-error">{formErrors.phone}</span>}
            </label>

            <label className="full-width">
              Link ảnh đại diện (AVT)
              <input
                  type="text"
                  value={formData.avt || ''}
                  onChange={(e) => handleChange('avt', e.target.value)}
                  placeholder="Nhập đường dẫn ảnh đại diện..."
              />
              {formErrors.avt && <span className="field-error">{formErrors.avt}</span>}
            </label>

          </div>

          <div className="form-actions">
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default MyProfile;
