import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  MdDashboard,
  MdQuiz,
  MdArrowDropDown,
  MdLogout,
  MdMenu,
  MdPerson,
  MdHistory,
} from 'react-icons/md';
import authService from '../../services/authService';
import './StudentLayout.css';

function StudentLayout() {
  const navigate = useNavigate();
  const [user] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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

  const displayName =
    user?.FullName || user?.username || user?.email || 'Sinh viên';

  return (
    <div className={`student-layout ${sidebarOpen ? 'stu-sidebar-open' : 'stu-sidebar-closed'}`}>
      {/* Header */}
      <header className="student-header">
        <div className="student-header-inner">
          <div className="student-header-left">
            <button
              className="student-menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle Sidebar"
            >
              <MdMenu size={24} />
            </button>
            <h1 className="student-logo">
              <span className="student-logo-icon">S</span>
              <span className="student-logo-text">Sinh viên</span>
            </h1>
          </div>
          <div className="student-header-right">
            {user ? (
              <div className="student-user-menu" ref={dropdownRef}>
                <button
                  type="button"
                  className="student-user-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="student-user-avatar">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="student-user-name">{displayName}</span>
                  <MdArrowDropDown
                    className={`student-user-caret ${dropdownOpen ? 'open' : ''}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="student-user-dropdown">
                    <button
                      type="button"
                      className="student-dropdown-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/student/my-profile');
                      }}
                    >
                      <MdPerson /> Hồ sơ cá nhân
                    </button>
                    <button
                      type="button"
                      className="student-dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      <MdLogout /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button type="button" className="student-dropdown-item" onClick={handleLogout}>
                Đăng xuất
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="student-body">
        <aside className="student-sidebar">
          <NavLink
            to="/student"
            end
            className={({ isActive }) =>
              `student-nav-link ${isActive ? 'active' : ''}`
            }
            title="Dashboard"
          >
            <MdDashboard className="student-nav-link-icon" />
            <span className="student-nav-text">Dashboard</span>
          </NavLink>

          <div className="student-nav-section">
            <span className="student-nav-text">Học tập</span>
          </div>

          <NavLink
            to="/student/exams"
            className={({ isActive }) =>
              `student-nav-link ${isActive ? 'active' : ''}`
            }
            title="Làm bài thi"
          >
            <MdQuiz className="student-nav-link-icon" />
            <span className="student-nav-text">Làm bài thi</span>
          </NavLink>

          <NavLink
            to="/student/practice-exams"
            className={({ isActive }) =>
              `student-nav-link ${isActive ? 'active' : ''}`
            }
            title="Luyện Thi / Ôn Tập"
          >
            <MdQuiz className="student-nav-link-icon" />
            <span className="student-nav-text">Luyện Thi / Ôn Tập</span>
          </NavLink>

          <NavLink
            to="/student/exam-history"
            className={({ isActive }) =>
              `student-nav-link ${isActive ? 'active' : ''}`
            }
            title="Lịch sử thi"
          >
            <MdHistory className="student-nav-link-icon" />
            <span className="student-nav-text">Lịch sử thi</span>
          </NavLink>
        </aside>

        <main className="student-main">
          <div className="student-main-content">
            <Outlet />
          </div>
          <footer className="student-footer">
            <p>&copy; 2026 Hệ thống Thi Trực Tuyến - Trường Đại Học Vinh</p>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;
