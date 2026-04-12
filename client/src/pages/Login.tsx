import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const AdminLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.username.trim()) newErrors.username = 'Vui lòng nhập tài khoản.';
    if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitError('');
    setLoading(true);
    try {
      const response = await authService.login(formData.username, formData.password);
      const { success, data } = response as any;

      if (success) {
        localStorage.setItem('access_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Redirect theo role: 0,1 → admin, 2 → student
        const role = data.user?.role;
        if (role === 2) {
          navigate('/student');
        } else {
          navigate('/admin');
        }
      } else {
        setSubmitError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err: any) {
      const apiMessage =
        err.response?.data?.errors?.username?.[0] || err.response?.data?.message || err.message;
      setSubmitError(apiMessage || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Bitter:wght@600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                .al-root {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'DM Sans', sans-serif;
                    background: #EEF2F8;
                    padding: 24px;
                    position: relative;
                    overflow: hidden;
                }

                /* Subtle background shapes */
                .al-bg-circle-1 {
                    position: fixed;
                    top: -120px; right: -120px;
                    width: 480px; height: 480px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(0,63,135,0.07) 0%, transparent 70%);
                    pointer-events: none;
                }
                .al-bg-circle-2 {
                    position: fixed;
                    bottom: -100px; left: -100px;
                    width: 400px; height: 400px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(232,96,10,0.06) 0%, transparent 70%);
                    pointer-events: none;
                }

                /* Card */
                .al-card {
                    width: 100%;
                    max-width: 420px;
                    background: #ffffff;
                    border-radius: 16px;
                    padding: 44px 40px 36px;
                    box-shadow:
                        0 2px 4px rgba(0,45,107,0.04),
                        0 8px 24px rgba(0,45,107,0.08),
                        0 24px 48px rgba(0,45,107,0.06);
                    border: 1px solid rgba(0,45,107,0.08);
                    animation: al-rise 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
                }

                @keyframes al-rise {
                    from { opacity: 0; transform: translateY(16px) scale(0.99); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }

                /* Header */
                .al-header {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding-bottom: 24px;
                    margin-bottom: 24px;
                    border-bottom: 1px solid #EEF2F8;
                }

                .al-logo {
                    width: 52px; height: 52px;
                    object-fit: contain;
                    flex-shrink: 0;
                }

                .al-school-name {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13px;
                    font-weight: 600;
                    color: #002D6B;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    line-height: 1.35;
                }

                .al-school-name span {
                    display: block;
                    font-size: 10px;
                    font-weight: 400;
                    color: #E8600A;
                    letter-spacing: 0.1em;
                    margin-top: 3px;
                    text-transform: uppercase;
                }

                /* Title section */
                .al-title-row { margin-bottom: 28px; }

                .al-title {
                    font-family: 'Bitter', serif;
                    font-size: 24px;
                    font-weight: 700;
                    color: #002D6B;
                    letter-spacing: -0.02em;
                    line-height: 1.2;
                    margin-bottom: 6px;
                }

                .al-subtitle {
                    font-size: 13px;
                    color: #8896AA;
                    font-weight: 300;
                }

                /* Field */
                .al-field { margin-bottom: 16px; }

                .al-label {
                    display: block;
                    font-size: 12px;
                    font-weight: 500;
                    color: #4A5568;
                    margin-bottom: 6px;
                    letter-spacing: 0.01em;
                }

                .al-input-wrap { position: relative; }

                .al-input-icon {
                    position: absolute;
                    left: 13px; top: 50%;
                    transform: translateY(-50%);
                    color: #A0AEC0;
                    pointer-events: none;
                    display: flex; align-items: center;
                    transition: color 0.18s;
                }

                .al-input-wrap.is-focused .al-input-icon { color: #003F87; }

                .al-input {
                    width: 100%;
                    height: 44px;
                    padding: 0 12px 0 40px;
                    border: 1.5px solid #D8E2EE;
                    border-radius: 8px;
                    background: #FAFCFF;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px;
                    color: #0D1B2E;
                    outline: none;
                    transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
                }

                .al-input::placeholder { color: #C0CCDA; }

                .al-input:focus {
                    border-color: #003F87;
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(0,63,135,0.09);
                }

                .al-input.has-error {
                    border-color: #E53E3E;
                    box-shadow: 0 0 0 3px rgba(229,62,62,0.09);
                }

                .al-input-pr { padding-right: 42px; }

                .al-eye-btn {
                    position: absolute;
                    right: 10px; top: 50%; transform: translateY(-50%);
                    background: none; border: none; cursor: pointer;
                    color: #A0AEC0; padding: 4px; border-radius: 5px;
                    display: flex; align-items: center;
                    transition: color 0.15s;
                }
                .al-eye-btn:hover { color: #003F87; }

                .al-field-err {
                    font-size: 11.5px;
                    color: #E53E3E;
                    margin-top: 5px;
                    font-weight: 500;
                    display: flex; align-items: center; gap: 4px;
                }

                /* Submit error banner */
                .al-banner {
                    background: #FFF5F5;
                    border: 1px solid #FED7D7;
                    border-left: 3px solid #E53E3E;
                    border-radius: 7px;
                    padding: 10px 13px;
                    font-size: 13px;
                    color: #C53030;
                    margin-bottom: 16px;
                    display: flex; align-items: flex-start; gap: 8px;
                }

                /* Options row */
                .al-options {
                    display: flex; align-items: center; justify-content: space-between;
                    margin: 18px 0 22px;
                }

                .al-remember {
                    display: flex; align-items: center; gap: 8px;
                    cursor: pointer; user-select: none;
                }

                .al-checkbox {
                    width: 16px; height: 16px;
                    border: 1.5px solid #D8E2EE;
                    border-radius: 4px;
                    appearance: none; -webkit-appearance: none;
                    background: white; cursor: pointer; position: relative;
                    transition: border-color 0.15s, background 0.15s;
                    flex-shrink: 0;
                }

                .al-checkbox:checked { background: #003F87; border-color: #003F87; }

                .al-checkbox:checked::after {
                    content: '';
                    position: absolute;
                    left: 4px; top: 1.5px;
                    width: 5px; height: 9px;
                    border: 2px solid white;
                    border-top: none; border-left: none;
                    transform: rotate(45deg);
                }

                .al-remember-label {
                    font-size: 13px;
                    color: #718096;
                }

                .al-forgot {
                    background: none; border: none; cursor: pointer;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13px;
                    font-weight: 500;
                    color: #003F87;
                    padding: 0;
                    position: relative;
                }

                .al-forgot::after {
                    content: '';
                    position: absolute; bottom: -1px; left: 0; right: 100%;
                    height: 1px;
                    background: #003F87;
                    transition: right 0.22s ease;
                }
                .al-forgot:hover::after { right: 0; }

                /* Submit button */
                .al-btn {
                    width: 100%;
                    height: 46px;
                    background: #002D6B;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px;
                    font-weight: 600;
                    letter-spacing: 0.03em;
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    position: relative; overflow: hidden;
                    transition: background 0.18s, box-shadow 0.18s, transform 0.12s;
                    box-shadow: 0 3px 12px rgba(0,45,107,0.28);
                }

                .al-btn:hover:not(:disabled) {
                    background: #003F87;
                    box-shadow: 0 5px 18px rgba(0,45,107,0.38);
                    transform: translateY(-1px);
                }

                .al-btn:active:not(:disabled) { transform: translateY(0); box-shadow: 0 2px 8px rgba(0,45,107,0.2); }
                .al-btn:disabled { opacity: 0.65; cursor: not-allowed; }

                .al-btn-shine {
                    position: absolute; inset: 0;
                    background: linear-gradient(110deg, transparent 38%, rgba(255,255,255,0.1) 50%, transparent 62%);
                    transform: translateX(-100%);
                    transition: transform 0.55s ease;
                }
                .al-btn:hover:not(:disabled) .al-btn-shine { transform: translateX(100%); }

                /* Spinner */
                .al-spin {
                    width: 15px; height: 15px;
                    border: 2px solid rgba(255,255,255,0.25);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.65s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* Footer */
                .al-footer {
                    text-align: center;
                    margin-top: 22px;
                    font-size: 11px;
                    color: #A0AEC0;
                    line-height: 1.7;
                    font-weight: 300;
                }
            `}</style>

      <div className="al-root">
        <div className="al-bg-circle-1" />
        <div className="al-bg-circle-2" />

        <div className="al-card">
          {/* Header */}
          <div className="al-header">
            <img
              className="al-logo"
              src="https://upload.wikimedia.org/wikipedia/vi/3/3a/Logo_Tr%C6%B0%E1%BB%9Dng_%C4%90%E1%BA%A1i_h%E1%BB%8Dc_Vinh.jpg"
              alt="Logo Trường Đại Học Vinh"
              onError={(e: any) => (e.target.style.opacity = '0')}
            />
            <div className="al-school-name">
              Trường Đại Học Vinh
              <span>USMART · Hệ thống quản trị thông minh</span>
            </div>
          </div>

          {/* Title */}
          <div className="al-title-row">
            <h1 className="al-title">Đăng nhập</h1>
            <p className="al-subtitle">Nhập thông tin tài khoản của bạn</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {submitError && (
              <div className="al-banner">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  style={{ flexShrink: 0, marginTop: 1 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {submitError}
              </div>
            )}

            {/* Username */}
            <div className="al-field">
              <label className="al-label">Tài khoản</label>
              <div className={`al-input-wrap${focused === 'username' ? ' is-focused' : ''}`}>
                <span className="al-input-icon">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onFocus={() => setFocused('username')}
                  onBlur={() => setFocused('')}
                  placeholder="Tên tài khoản"
                  className={`al-input${errors.username ? ' has-error' : ''}`}
                  autoComplete="username"
                />
              </div>
              {errors.username && (
                <div className="al-field-err">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#E53E3E">
                    <circle cx="12" cy="12" r="10" />
                    <path fill="white" d="M11 8h2v5h-2zm0 7h2v2h-2z" />
                  </svg>
                  {errors.username}
                </div>
              )}
            </div>

            {/* Password */}
            <div className="al-field">
              <label className="al-label">Mật khẩu</label>
              <div className={`al-input-wrap${focused === 'password' ? ' is-focused' : ''}`}>
                <span className="al-input-icon">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused('')}
                  placeholder="Mật khẩu"
                  className={`al-input al-input-pr${errors.password ? ' has-error' : ''}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="al-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="al-field-err">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#E53E3E">
                    <circle cx="12" cy="12" r="10" />
                    <path fill="white" d="M11 8h2v5h-2zm0 7h2v2h-2z" />
                  </svg>
                  {errors.password}
                </div>
              )}
            </div>

            {/* Remember / Forgot */}
            <div className="al-options">
              <label className="al-remember">
                <input
                  type="checkbox"
                  className="al-checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="al-remember-label">Ghi nhớ đăng nhập</span>
              </label>
              <button type="button" className="al-forgot">
                Quên mật khẩu?
              </button>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="al-btn">
              <div className="al-btn-shine" />
              {loading ? (
                <>
                  <div className="al-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="al-footer">
            © {new Date().getFullYear()} Trường Đại Học Vinh · USMART<br />
            Hệ thống quản trị đại học thông minh
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
