import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './AdminLayout.css';

function AdminLayout() {
  const navigate = useNavigate();
  const [user] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const isAdmin = user?.role === 0;

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-inner">
          <h1 className="admin-logo">Quản trị ThiTT</h1>
          <div className="admin-header-right">
            {user ? (
              <div className="admin-user-menu" ref={dropdownRef}>
                <button 
                  type="button" 
                  className="admin-user-btn" 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="admin-user-name">{user.username || user.email}</span>
                  <span className={`admin-user-caret ${dropdownOpen ? 'open' : ''}`}>▼</span>
                </button>
                
                {dropdownOpen && (
                  <div className="admin-user-dropdown">
                    {user.role === 1 && (
                      <NavLink 
                        to="/admin/my-profile" 
                        className="admin-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Hồ sơ cá nhân
                      </NavLink>
                    )}
                    <button type="button" className="admin-dropdown-item text-danger" onClick={handleLogout}>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
                <button type="button" className="admin-logout-btn" onClick={handleLogout}>
                  Đăng xuất
                </button>
            )}
          </div>
        </div>
      </header>
      <div className="admin-body">
        <aside className="admin-sidebar">
          <NavLink to="/admin" end className="admin-nav-link">
            Dashboard
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin/users" className="admin-nav-link">
              Quản lý tài khoản
            </NavLink>
          )}
          <NavLink to="/admin/institutes" className="admin-nav-link">
            Quản lý viện
          </NavLink>
          <NavLink to="/admin/departments" className="admin-nav-link">
            Quản lý khoa
          </NavLink>
          <NavLink to="/admin/semesters" className="admin-nav-link">
            Quản lý học kỳ
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin/teacher-profiles" className="admin-nav-link">
              Hồ sơ giảng viên
            </NavLink>
          )}
          <NavLink to="/admin/student-profiles" className="admin-nav-link">
            Quản lý sinh viên
          </NavLink>
          <div className="admin-nav-section">Chức năng khác</div>
          <NavLink to="/admin/subjects" className="admin-nav-link">
            Quản lý môn học
          </NavLink>
          <NavLink to="/admin/course-sections" className="admin-nav-link">
            Quản lý lớp học phần
          </NavLink>
          <NavLink to="/admin/questions" className="admin-nav-link">
            Quản lý câu hỏi
          </NavLink>
          <NavLink to="/admin/question-banks" className="admin-nav-link">
            Quản lý ngân hàng câu hỏi
          </NavLink>
          <span className="admin-nav-muted">Quản lý đề thi</span>
        </aside>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
