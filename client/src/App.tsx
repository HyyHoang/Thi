import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AdminLayout from './pages/admin/AdminLayout.tsx';
import AdminHome from './pages/admin/AdminHome.tsx';
import UserList from './pages/admin/users/UserList.tsx';
import InstituteList from './pages/admin/institutes/InstituteList.tsx';
import DepartmentList from './pages/admin/departments/DepartmentList.tsx';
import TeacherProfileList from './pages/admin/teacher-profiles/TeacherProfileList.tsx';
import MyProfile from './pages/admin/teacher-profiles/MyProfile.tsx';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[0, 1]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={[0]}>
                <UserList />
              </ProtectedRoute>
            }
          />
          <Route
            path="institutes"
            element={
              <ProtectedRoute allowedRoles={[0, 1]}>
                <InstituteList />
              </ProtectedRoute>
            }
          />
          <Route
            path="departments"
            element={
              <ProtectedRoute allowedRoles={[0, 1]}>
                <DepartmentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="teacher-profiles"
            element={
              <ProtectedRoute allowedRoles={[0]}>
                <TeacherProfileList />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-profile"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <MyProfile />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </div>
  );
}

export default App;
