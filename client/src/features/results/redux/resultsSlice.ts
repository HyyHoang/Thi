import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import resultsService from '../../../services/resultsService';
import { ApiListResponse, ApiSingleResponse, Result } from '../../../types';

export interface ResultsState {
    selected?: Result | null;
    loading: boolean;
    error?: string | null;
}

const initialState: ResultsState = {
    selected: null,
    loading: false,
    error: null,
};
export const fetchResultDetails = createAsyncThunk<
    ApiSingleResponse<Result>,
    number | string,
    { rejectValue: string }
>('results/fetchDetails', async (id, { rejectWithValue }) => {
    try {
        const response = await resultsService.getById(id);
        return response as ApiSingleResponse<Result>;
    } catch (error: any) {
        const message = error?.response?.data?.message || 'Không thể tải chi tiết kết quả.';
        return rejectWithValue(message);
    }
});

export const fetchResultByAttempt = createAsyncThunk<
    ApiSingleResponse<Result>,
    number | string,
    { rejectValue: string }
>('results/fetchByAttempt', async (attemptId, { rejectWithValue }) => {
    try {
        const response = await resultsService.getByAttempt(attemptId);
        return response as ApiSingleResponse<Result>;
    } catch (error: any) {
        const message = error?.response?.data?.message || 'Không thể tải chi tiết kết quả.';
        return rejectWithValue(message);
    }
});

const resultsSlice = createSlice({
    name: 'results',
    initialState,
    reducers: {
        clearSelectedResult(state) {
            state.selected = null;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchDetails
            .addCase(fetchResultDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchResultDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.selected = action.payload.data;
            })
            .addCase(fetchResultDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Không thể tải chi tiết kết quả.';
            })
            // fetchByAttempt
            .addCase(fetchResultByAttempt.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchResultByAttempt.fulfilled, (state, action) => {
                state.loading = false;
                state.selected = action.payload.data;
            })
            .addCase(fetchResultByAttempt.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Không thể tải chi tiết kết quả.';
            });
    },
});

export const { clearSelectedResult, clearError } = resultsSlice.actions;

export default resultsSlice.reducer;
