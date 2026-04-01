import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  MdDashboard, 
  MdSupervisedUserCircle, 
  MdAccountBalance, 
  MdBusiness, 
  MdDateRange, 
  MdPersonOutline, 
  MdPeople, 
  MdMenuBook, 
  MdClass, 
  MdQuiz, 
  MdLibraryBooks, 
  MdDescription,
  MdAssignment,
  MdArrowDropDown,
  MdLogout,
  MdMenu
} from 'react-icons/md';
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
  const isStudent = user?.role === 2;

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-header-left">
            <button 
              className="admin-menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle Sidebar"
            >
              <MdMenu size={24} />
            </button>
            <h1 className="admin-logo">
              <span className="admin-logo-icon">Q</span>
              <span className="admin-logo-text">Quản trị ThiTT</span>
            </h1>
          </div>
          <div className="admin-header-right">
            {user ? (
              <div className="admin-user-menu" ref={dropdownRef}>
                <button 
                  type="button" 
                  className="admin-user-btn" 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="admin-user-avatar">
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="admin-user-name">{user.username || user.email}</span>
                  <MdArrowDropDown className={`admin-user-caret ${dropdownOpen ? 'open' : ''}`} />
                </button>
                
                {dropdownOpen && (
                  <div className="admin-user-dropdown">
                    {user.role === 1 && (
                      <NavLink 
                        to="/admin/my-profile" 
                        className="admin-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <MdPersonOutline /> Hồ sơ cá nhân
                      </NavLink>
                    )}
                    <button type="button" className="admin-dropdown-item text-danger" onClick={handleLogout}>
                      <MdLogout /> Đăng xuất
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
          <NavLink to="/admin" end className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} title="Dashboard">
            <MdDashboard className="admin-nav-link-icon" /> <span className="admin-nav-text">Dashboard</span>
          </NavLink>
          {!isStudent && (
            <>
              {isAdmin && (
                <NavLink to="/admin/users" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} title="Quản lý tài khoản">
                  <MdSupervisedUserCircle className="admin-nav-link-icon" /> <span className="admin-nav-text">Quản lý tài khoản</span>
                </NavLink>
              )}
              <NavLink to="/admin/institutes" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} title="Quản lý viện">
                <MdAccountBalance className="admin-nav-link-icon" /> <span className="admin-nav-text">Quản lý viện</span>
              </NavLink>
              <NavLink to="/admin/departments" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} title="Quản lý khoa">
                <MdBusiness className="admin-nav-link-icon" /> <span className="admin-nav-text">Quản lý khoa</span>
              </NavLink>
              <NavLink to="/admin/semesters" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} title="Quản lý học kỳ">
                <MdDateRange className="admin-nav-link-icon" /> <span className="admin-nav-text">Quản lý học kỳ</span>
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin/teacher-profiles" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} title="Hồ sơ giảng viên">
                  <MdPersonOutline className="admin-nav-link-icon" /> <span className="admin-nav-text">Hồ sơ giảng viên</span>
                </NavLink>
              )}
              <NavLink to="/admin/student-profiles" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} title="Quản lý sinh viên">
                <MdPeople className="admin-nav-link-icon" /> <span className="admin-nav-text">Quản lý sinh viên</span>
              </NavLink>
              <div className="admin-nav-section"><span className="admin-nav-text">Chức năng khác</span></div>
              <NavLink to="/admin/subjects" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} title="Quản lý môn học">
                <MdMenuBook className="admin-nav-link-icon" /> <span className="admin-nav-text">Quản lý môn học</span>
              </NavLink>
              <NavLink to="/admin/course-sections" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} title="Quản lý lớp học phần">
                <MdClass className="admin-nav-link-icon" /> <span className="admin-nav-text">Quản lý lớp học phần</span>
              </NavLink>
              <NavLink to="/admin/enrollments" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} title="Quản lý đăng ký">
                <MdAssignment className="admin-nav-link-icon" /> <span className="admin-nav-text">Quản lý đăng ký</span>
              </NavLink>
              <NavLink to="/admin/questions" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} title="Quản lý câu hỏi">
                <MdQuiz className="admin-nav-link-icon" /> <span className="admin-nav-text">Quản lý câu hỏi</span>
              </NavLink>
              <NavLink to="/admin/question-banks" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} title="Quản lý ngân hàng câu hỏi">
                <MdLibraryBooks className="admin-nav-link-icon" /> <span className="admin-nav-text">Quản lý ngân hàng câu hỏi</span>
              </NavLink>
            </>
          )}

          {isStudent && (
            <NavLink to="/admin/course-registration" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} title="Đăng ký học phần">
              <MdAssignment className="admin-nav-link-icon" /> <span className="admin-nav-text">Đăng ký học phần</span>
            </NavLink>
          )}

          {!isStudent && (
            <NavLink to="/admin/exams" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} title="Quản lý đề thi">
              <MdDescription className="admin-nav-link-icon" /> <span className="admin-nav-text">Quản lý đề thi</span>
            </NavLink>
          )}
        </aside>
        <main className="admin-main">
          <div className="admin-main-content">
            <Outlet />
          </div>
          <footer className="admin-footer">
            <p>&copy; 2026 Hệ thống Quản trị ThiTT - Phát triển bởi Huy Hoàng</p>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
