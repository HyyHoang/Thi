import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Exam } from '../../../types';
import { fetchExams, createExam, updateExam, deleteExam, fetchExamById } from './examThunks';

export interface ExamsState {
    items: Exam[];
    selected: Exam | null;
    loading: boolean;
    error: string | null;
}

const initialState: ExamsState = {
    items: [],
    selected: null,
    loading: false,
    error: null,
};

const examSlice = createSlice({
    name: 'exams',
    initialState,
    reducers: {
        setSelectedExam(state, action: PayloadAction<Exam | null>) {
            state.selected = action.payload;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetch all
            .addCase(fetchExams.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExams.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
            })
            .addCase(fetchExams.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch exams';
            })
            // fetch one
            .addCase(fetchExamById.fulfilled, (state, action) => {
                state.selected = action.payload.data;
            })
            // create
            .addCase(createExam.fulfilled, (state, action) => {
                state.items.push(action.payload.data);
            })
            .addCase(createExam.rejected, (state, action) => {
                state.error = action.payload || 'Failed to create exam';
            })
            // update
            .addCase(updateExam.fulfilled, (state, action) => {
                const updated = action.payload.data;
                const index = state.items.findIndex(e => e.exam_id === updated.exam_id);
                if (index !== -1) state.items[index] = updated;
            })
            .addCase(updateExam.rejected, (state, action) => {
                state.error = action.payload || 'Failed to update exam';
            })
            // delete
            .addCase(deleteExam.fulfilled, (state, action) => {
                state.items = state.items.filter(e => e.exam_id !== action.payload.id);
            })
            .addCase(deleteExam.rejected, (state, action) => {
                state.error = action.payload || 'Failed to delete exam';
            });
    },
});

export const { setSelectedExam, clearError } = examSlice.actions;
export default examSlice.reducer;
