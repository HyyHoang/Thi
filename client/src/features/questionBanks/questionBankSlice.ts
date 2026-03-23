import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import questionBankService from '../../services/questionBankService';
import { QuestionBank } from '../../types';

export interface QuestionBanksState {
    items: QuestionBank[];
    loading: boolean;
    error?: string | null;
}

const initialState: QuestionBanksState = {
    items: [],
    loading: false,
    error: null,
};

export const fetchQuestionBanks = createAsyncThunk<
    { data: QuestionBank[] },
    void,
    { rejectValue: string }
>('questionBanks/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = (await questionBankService.getAll()) as {
            success?: boolean;
            data: QuestionBank[];
        };
        return { data: response.data ?? [] };
    } catch (error: any) {
        const message = error?.response?.data?.message || 'Không thể tải danh sách ngân hàng.';
        return rejectWithValue(message);
    }
});

const questionBankSlice = createSlice({
    name: 'questionBanks',
    initialState,
    reducers: {
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchQuestionBanks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchQuestionBanks.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
            })
            .addCase(fetchQuestionBanks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Không thể tải danh sách ngân hàng.';
            });
    },
});

export const { clearError } = questionBankSlice.actions;

export default questionBankSlice.reducer;
