import { RootState } from '../../../lib/store/redux/store';

export const selectExamAttempts = (state: RootState) => state.examAttempts.items;
export const selectExamAttemptsLoading = (state: RootState) => state.examAttempts.loading;
export const selectExamAttemptsError = (state: RootState) => state.examAttempts.error;
