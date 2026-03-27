import { RootState } from '../../app/store';

export const selectStudentProfiles = (state: RootState) => state.studentProfiles.profiles;
export const selectStudentProfilesLoading = (state: RootState) => state.studentProfiles.loading;
export const selectStudentProfilesError = (state: RootState) => state.studentProfiles.error;
