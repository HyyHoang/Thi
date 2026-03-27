import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AdminLayout from './pages/admin/AdminLayout.tsx';
import AdminHome from './pages/admin/AdminHome.tsx';
import UserList from './pages/admin/users/UserList.tsx';
import InstituteList from './pages/admin/institutes/InstituteList.tsx';
import DepartmentList from './pages/admin/departments/DepartmentList.tsx';
import SemesterList from './pages/admin/semesters/SemesterList.tsx';
import TeacherProfileList from './pages/admin/teacher-profiles/TeacherProfileList.tsx';
import MyProfile from './pages/admin/teacher-profiles/MyProfile.tsx';
import SubjectList from './pages/admin/subjects/SubjectList.tsx';
import QuestionList from './pages/admin/questions/QuestionList.tsx';
import QuestionBankList from './pages/admin/question-banks/QuestionBankList.tsx';
import StudentProfileList from './pages/admin/student-profiles/StudentProfileList.tsx';
import CourseSectionList from './pages/admin/course-sections/CourseSectionList.tsx';
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
            path="semesters"
            element={
              <ProtectedRoute allowedRoles={[0, 1]}>
                <SemesterList />
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
          <Route
            path="subjects"
            element={
              <ProtectedRoute allowedRoles={[0, 1]}>
                <SubjectList />
              </ProtectedRoute>
            }
          />
          <Route
            path="questions"
            element={
              <ProtectedRoute allowedRoles={[0, 1]}>
                <QuestionList />
              </ProtectedRoute>
            }
          />
          <Route
            path="question-banks"
            element={
              <ProtectedRoute allowedRoles={[0, 1]}>
                <QuestionBankList />
              </ProtectedRoute>
            }
          />
          <Route
            path="student-profiles"
            element={
              <ProtectedRoute allowedRoles={[0, 1]}>
                <StudentProfileList />
              </ProtectedRoute>
            }
          />
          <Route
            path="course-sections"
            element={
              <ProtectedRoute allowedRoles={[0, 1]}>
                <CourseSectionList />
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
