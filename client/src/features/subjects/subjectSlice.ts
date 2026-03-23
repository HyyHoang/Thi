import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import subjectService from '../../services/subjectService';
import { Subject, SubjectPayload } from '../../types';

export interface SubjectsState {
    items: Subject[];
    selected: Subject | null;
    loading: boolean;
    error: string | null;
}

const initialState: SubjectsState = {
    items: [],
    selected: null,
    loading: false,
    error: null,
};

export const fetchSubjects = createAsyncThunk<Subject[], void, { rejectValue: string }>(
    'subjects/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await subjectService.getAll();
            // Assuming response is the array Directly or wrapped in data based on backend
            return (response as any).data ? (response as any).data : response;
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Không thể tải danh sách môn học.';
            return rejectWithValue(message);
        }
    }
);

export const createSubject = createAsyncThunk<Subject, SubjectPayload, { rejectValue: string }>(
    'subjects/create',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await subjectService.create(payload);
            return (response as any).data ? (response as any).data : response;
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Không thể tạo môn học.';
            return rejectWithValue(message);
        }
    }
);

export const updateSubject = createAsyncThunk<Subject, { id: string; payload: SubjectPayload }, { rejectValue: string }>(
    'subjects/update',
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            const response = await subjectService.update(id, payload);
            return (response as any).data ? (response as any).data : response;
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Không thể cập nhật môn học.';
            return rejectWithValue(message);
        }
    }
);

export const deleteSubject = createAsyncThunk<{ id: string }, string, { rejectValue: string }>(
    'subjects/delete',
    async (id, { rejectWithValue }) => {
        try {
            await subjectService.remove(id);
            return { id };
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Không thể xóa môn học (có thể đang được sử dụng).';
            return rejectWithValue(message);
        }
    }
);

const subjectSlice = createSlice({
    name: 'subjects',
    initialState,
    reducers: {
        setSelectedSubject(state, action: PayloadAction<Subject | null>) {
            state.selected = action.payload;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSubjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSubjects.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchSubjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch subjects';
            })
            .addCase(createSubject.pending, (state) => {
                state.error = null;
            })
            .addCase(createSubject.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(createSubject.rejected, (state, action) => {
                state.error = action.payload || 'Failed to create subject';
            })
            .addCase(updateSubject.pending, (state) => {
                state.error = null;
            })
            .addCase(updateSubject.fulfilled, (state, action) => {
                const updated = action.payload;
                const index = state.items.findIndex(s => s.SubjectID === updated.SubjectID);
                if (index !== -1) {
                    state.items[index] = updated;
                }
            })
            .addCase(updateSubject.rejected, (state, action) => {
                state.error = action.payload || 'Failed to update subject';
            })
            .addCase(deleteSubject.pending, (state) => {
                state.error = null;
            })
            .addCase(deleteSubject.fulfilled, (state, action) => {
                state.items = state.items.filter(s => s.SubjectID !== action.payload.id);
            })
            .addCase(deleteSubject.rejected, (state, action) => {
                state.error = action.payload || 'Failed to delete subject';
            });
    },
});

export const { setSelectedSubject, clearError } = subjectSlice.actions;

export default subjectSlice.reducer;
