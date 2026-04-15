import { createSlice } from '@reduxjs/toolkit';
import { ExamAttempt } from '../../../types';
import { fetchExamAttempts, createExamAttempt, updateExamAttempt, deleteExamAttempt } from './examAttemptThunks';

interface ExamAttemptState {
  items: ExamAttempt[];
  loading: boolean;
  error: string | null;
}

const initialState: ExamAttemptState = {
  items: [],
  loading: false,
  error: null,
};

const examAttemptSlice = createSlice({
  name: 'examAttempts',
  initialState,
  reducers: {
    clearExamAttemptError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetch
    builder
      .addCase(fetchExamAttempts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExamAttempts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchExamAttempts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // create
    builder
      .addCase(createExamAttempt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExamAttempt.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createExamAttempt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // update
    builder
      .addCase(updateExamAttempt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExamAttempt.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.attempt_id === action.payload.attempt_id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateExamAttempt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // delete
    builder
      .addCase(deleteExamAttempt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExamAttempt.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.attempt_id !== action.payload);
      })
      .addCase(deleteExamAttempt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearExamAttemptError } = examAttemptSlice.actions;

export default examAttemptSlice.reducer;
