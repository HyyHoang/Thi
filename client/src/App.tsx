import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AdminLayout from './components/layout/AdminLayout.tsx';
import AdminHome from './components/layout/AdminHome.tsx';
import StudentLayout from './components/layout/StudentLayout.tsx';
import StudentDashboard from './features/student/pages/StudentDashboard.tsx';
import StudentExamList from './features/student/pages/StudentExamList.tsx';
import TakeExam from './features/student/pages/TakeExam.tsx';
import ExamResult from './features/student/pages/ExamResult.tsx';
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
import EnrollmentManagementPage from './features/enrollments/pages/EnrollmentManagementPage.tsx';
import CourseRegistrationPage from './features/enrollments/pages/CourseRegistrationPage.tsx';
import ExamList from './features/exams/pages/ExamList.tsx';
import ExamAttemptList from './features/exam-attempts/pages/ExamAttemptList.tsx';
import './App.css';

/**
 * Smart redirect: nếu đã đăng nhập, redirect theo role.
 */
function SmartRedirect() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user?.role === 2) return <Navigate to="/student" replace />;
  } catch { /* ignore */ }
  return <Navigate to="/admin" replace />;
}

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<SmartRedirect />} />
        <Route path="/login" element={<Login />} />

        {/* ── Admin / Teacher Routes ── */}
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
          <Route
            path="enrollments"
            element={
              <ProtectedRoute allowedRoles={[0, 1]}>
                <EnrollmentManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="course-registration"
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <CourseRegistrationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="exams"
            element={
              <ProtectedRoute allowedRoles={[0, 1]}>
                <ExamList />
              </ProtectedRoute>
            }
          />
          <Route
            path="exam-attempts"
            element={
              <ProtectedRoute allowedRoles={[0, 1]}>
                <ExamAttemptList />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ── Student Routes ── */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="exams" element={<StudentExamList />} />
          <Route path="exams/:examId/take" element={<TakeExam />} />
          <Route path="exams/:attemptId/result" element={<ExamResult />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<SmartRedirect />} />
      </Routes>
    </div>
  );
}

export default App;
