import { RootState } from '../../../lib/store/redux/store';

export const selectInstitutesState = (state: RootState) => state.institutes;

export const selectInstitutes = (state: RootState) => state.institutes.items;
export const selectSelectedInstitute = (state: RootState) => state.institutes.selected;
export const selectInstitutesLoading = (state: RootState) => state.institutes.loading;
export const selectInstitutesError = (state: RootState) => state.institutes.error;
