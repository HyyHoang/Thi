import { configureStore } from '@reduxjs/toolkit';
import departmentsReducer from '../features/departments/departmentSlice';
import subjectsReducer from '../features/subjects/subjectSlice';
import questionsReducer from '../features/questions/questionSlice';
import questionBanksReducer from '../features/questionBanks/questionBankSlice';
import studentProfilesReducer from '../features/student-profiles/studentProfileSlice';
import courseSectionsReducer from '../features/course-sections/courseSectionSlice';

const store = configureStore({
    reducer: {
        departments: departmentsReducer,
        subjects: subjectsReducer,
        questions: questionsReducer,
        questionBanks: questionBanksReducer,
        studentProfiles: studentProfilesReducer,
        courseSections: courseSectionsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
