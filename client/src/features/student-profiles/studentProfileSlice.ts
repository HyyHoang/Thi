import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { StudentProfile, StudentProfilePayload } from '../../types';
import { studentProfileService } from '../../services/studentProfileService';

interface StudentProfileState {
    profiles: StudentProfile[];
    loading: boolean;
    error: string | null;
}

const initialState: StudentProfileState = {
    profiles: [],
    loading: false,
    error: null,
};

export const fetchStudentProfiles = createAsyncThunk(
    'studentProfiles/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await studentProfileService.getAll();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch student profiles');
        }
    }
);

export const createStudentProfile = createAsyncThunk(
    'studentProfiles/create',
    async (payload: StudentProfilePayload, { rejectWithValue }) => {
        try {
            return await studentProfileService.create(payload);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create student profile');
        }
    }
);

export const updateStudentProfile = createAsyncThunk(
    'studentProfiles/update',
    async ({ id, payload }: { id: string; payload: Partial<StudentProfilePayload> }, { rejectWithValue }) => {
        try {
            return await studentProfileService.update(id, payload);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update student profile');
        }
    }
);

export const deleteStudentProfile = createAsyncThunk(
    'studentProfiles/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            await studentProfileService.delete(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete student profile');
        }
    }
);

const studentProfileSlice = createSlice({
    name: 'studentProfiles',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchStudentProfiles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStudentProfiles.fulfilled, (state, action) => {
                state.loading = false;
                state.profiles = action.payload;
            })
            .addCase(fetchStudentProfiles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create
            .addCase(createStudentProfile.fulfilled, (state, action) => {
                state.profiles.push(action.payload);
            })
            // Update
            .addCase(updateStudentProfile.fulfilled, (state, action) => {
                const index = state.profiles.findIndex(p => p.StudentID === action.payload.StudentID);
                if (index !== -1) {
                    state.profiles[index] = action.payload;
                }
            })
            // Delete
            .addCase(deleteStudentProfile.fulfilled, (state, action) => {
                state.profiles = state.profiles.filter(p => p.StudentID !== action.payload);
            });
    },
});

export const { clearError } = studentProfileSlice.actions;
export default studentProfileSlice.reducer;
