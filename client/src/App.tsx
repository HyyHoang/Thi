import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AdminLayout from './components/layout/AdminLayout.tsx';
import AdminHome from './components/layout/AdminHome.tsx';
import UserList from './features/users/pages/UserList.tsx';
import InstituteList from './features/institutes/pages/InstituteList.tsx';
import DepartmentList from './features/departments/pages/DepartmentList.tsx';
import SemesterList from './features/semesters/pages/SemesterList.tsx';
import TeacherProfileList from './features/teacher-profiles/pages/TeacherProfileList.tsx';
import MyProfile from './features/teacher-profiles/pages/MyProfile.tsx';
import SubjectList from './features/subjects/pages/SubjectList.tsx';
import QuestionList from './features/questions/pages/QuestionList.tsx';
import QuestionBankList from './features/question-banks/pages/QuestionBankList.tsx';
import StudentProfileList from './features/student-profiles/pages/StudentProfileList.tsx';
import CourseSectionList from './features/course-sections/pages/CourseSectionList.tsx';
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
