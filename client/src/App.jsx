import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './pages/admin/AdminLayout';
import AdminHome from './pages/admin/AdminHome';
import UserList from './pages/admin/users/UserList';
import InstituteList from './pages/admin/institutes/InstituteList';
import DepartmentList from './pages/admin/departments/DepartmentList';
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
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </div>
  );
}

export default App;
