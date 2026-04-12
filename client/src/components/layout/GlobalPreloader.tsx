import { useEffect, useRef } from 'react';
import { useAppDispatch } from '../../lib/store/redux/hooks';
import { fetchUsers } from '../../features/users/redux/userThunks';
import { fetchInstitutes } from '../../features/institutes/redux/instituteThunks';
import { fetchDepartments } from '../../features/departments/redux/departmentThunks';
import { fetchSemesters } from '../../features/semesters/redux/semesterThunks';
import { fetchTeacherProfiles } from '../../features/teacher-profiles/redux/teacherProfileThunks';
import { fetchStudentProfiles } from '../../features/student-profiles/redux/studentProfileThunks';
import { fetchSubjects } from '../../features/subjects/redux/subjectThunks';
import { fetchCourseSections } from '../../features/course-sections/redux/courseSectionThunks';
import { fetchQuestions } from '../../features/questions/redux/questionSlice';
import { fetchQuestionBanks } from '../../features/question-banks/redux/questionBankThunks';
import { fetchEnrollments } from '../../features/enrollments/api';
import { fetchExams } from '../../features/exams/redux/examThunks';
import { fetchExamAttempts } from '../../features/exam-attempts/redux/examAttemptThunks';

interface GlobalPreloaderProps {
  role: number;
}

export default function GlobalPreloader({ role }: GlobalPreloaderProps) {
  const dispatch = useAppDispatch();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    // Load data based on roles concurrently
    if (role === 0 || role === 1) {
      if (role === 0) {
        dispatch(fetchUsers());
        dispatch(fetchTeacherProfiles());
      }
      dispatch(fetchInstitutes());
      dispatch(fetchDepartments());
      dispatch(fetchSemesters());
      dispatch(fetchStudentProfiles());
      dispatch(fetchSubjects());
      dispatch(fetchCourseSections());
      dispatch(fetchQuestions());
      dispatch(fetchQuestionBanks());
      dispatch(fetchEnrollments());
      dispatch(fetchExams());
      dispatch(fetchExamAttempts());
    }
    if (role === 2) {
      dispatch(fetchEnrollments());
    }
  }, [dispatch, role]);

  return null;
}
