import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './AdminLayout.css';

function AdminLayout() {
  const navigate = useNavigate();
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

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
            {user && (
              <span className="admin-user">
                {user.username || user.email}
              </span>
            )}
            <button type="button" className="admin-logout-btn" onClick={handleLogout}>
              Đăng xuất
            </button>
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
          <div className="admin-nav-section">Chức năng khác</div>
          <span className="admin-nav-muted">Quản lý môn học</span>
          <span className="admin-nav-muted">Quản lý lớp học phần</span>
          <span className="admin-nav-muted">Quản lý câu hỏi</span>
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
