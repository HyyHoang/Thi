import React from 'react';
import './AdminHome.css';

function AdminHome() {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  return (
    <div className="admin-home">
      <h2>Trang chủ quản trị</h2>
      <p className="admin-welcome">
        Xin chào, <strong>{user.username || user.email || 'Admin'}</strong>.
      </p>
      <div className="admin-cards">
        <div className="admin-card">
          <span className="admin-card-icon">📋</span>
          <h3>Quản lý đề thi</h3>
          <p>Thêm, sửa, xóa đề thi và câu hỏi.</p>
        </div>
        <div className="admin-card">
          <span className="admin-card-icon">👥</span>
          <h3>Quản lý người dùng</h3>
          <p>Quản lý tài khoản và phân quyền.</p>
        </div>
        <div className="admin-card">
          <span className="admin-card-icon">📊</span>
          <h3>Thống kê</h3>
          <p>Xem báo cáo và kết quả thi.</p>
        </div>
      </div>
    </div>
  );
}

export default AdminHome;
