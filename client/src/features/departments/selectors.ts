import { createSelector } from 'reselect';
import { RootState } from '../../app/store';

const selectDepartmentsState = (state: RootState) => state.departments;

export const selectDepartments = createSelector(
    [selectDepartmentsState],
    (state) => state.items
);

export const selectDepartmentsLoading = createSelector(
    [selectDepartmentsState],
    (state) => state.loading
);

export const selectDepartmentsError = createSelector(
    [selectDepartmentsState],
    (state) => state.error
);

export const selectSelectedDepartment = createSelector(
    [selectDepartmentsState],
    (state) => state.selected
);

