import { createSelector } from 'reselect';
import { RootState } from '../../app/store';

const selectCourseSectionsState = (state: RootState) => state.courseSections;

export const selectCourseSections = createSelector(
    [selectCourseSectionsState],
    (state) => state.items
);

export const selectCourseSectionsLoading = createSelector(
    [selectCourseSectionsState],
    (state) => state.loading
);

export const selectCourseSectionsError = createSelector(
    [selectCourseSectionsState],
    (state) => state.error
);

export const selectSelectedCourseSection = createSelector(
    [selectCourseSectionsState],
    (state) => state.selected
);
