import { RootState } from '../../../lib/store/redux/store';

export const selectExams = (state: RootState) => state.exams.items;
export const selectExamsLoading = (state: RootState) => state.exams.loading;
export const selectExamsError = (state: RootState) => state.exams.error;
export const selectSelectedExam = (state: RootState) => state.exams.selected;
