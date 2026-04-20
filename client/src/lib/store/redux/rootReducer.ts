import { combineReducers } from '@reduxjs/toolkit';

import courseSectionsReducer from '../../../features/course-sections/redux/courseSectionSlice';
import departmentsReducer from '../../../features/departments/redux/departmentSlice';
import institutesReducer from '../../../features/institutes/redux/instituteSlice';
import semestersReducer from '../../../features/semesters/redux/semesterSlice';
import subjectsReducer from '../../../features/subjects/redux/subjectSlice';
import usersReducer from '../../../features/users/redux/userSlice';
import studentProfilesReducer from '../../../features/student-profiles/redux/studentProfileSlice';
import teacherProfilesReducer from '../../../features/teacher-profiles/redux/teacherProfileSlice';
import questionsReducer from '../../../features/questions/redux/questionSlice';
import questionBanksReducer from '../../../features/question-banks/redux/questionBankSlice';
import enrollmentsReducer from '../../../features/enrollments/api';
import examsReducer from '../../../features/exams/redux/examSlice';
import examAttemptsReducer from '../../../features/exam-attempts/redux/examAttemptSlice';
import resultsReducer from '../../../features/results/redux/resultsSlice';

export const rootReducer = combineReducers({
    courseSections: courseSectionsReducer,
    departments: departmentsReducer,
    institutes: institutesReducer,
    semesters: semestersReducer,
    subjects: subjectsReducer,
    users: usersReducer,
    studentProfiles: studentProfilesReducer,
    teacherProfiles: teacherProfilesReducer,
    questions: questionsReducer,
    questionBanks: questionBanksReducer,
    enrollments: enrollmentsReducer,
    exams: examsReducer,
    examAttempts: examAttemptsReducer,
    results: resultsReducer,
});
