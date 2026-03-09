import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './AdminLayout.css';

function AdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (_) {
      // ignore
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

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
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
