import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Institute } from '../../../types';
import { fetchInstitutes, createInstitute, updateInstitute, deleteInstitute } from './instituteThunks';

export interface InstitutesState {
    items: Institute[];
    selected?: Institute | null;
    loading: boolean;
    error?: string | null;
}

const initialState: InstitutesState = {
    items: [],
    selected: null,
    loading: false,
    error: null,
};

const institutesSlice = createSlice({
    name: 'institutes',
    initialState,
    reducers: {
        setSelectedInstitute(state, action: PayloadAction<Institute | null>) {
            state.selected = action.payload;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchInstitutes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInstitutes.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
            })
            .addCase(fetchInstitutes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Không thể tải danh sách viện.';
            })
            .addCase(createInstitute.pending, (state) => {
                state.error = null;
            })
            .addCase(createInstitute.fulfilled, (state, action) => {
                state.items.push(action.payload.data);
            })
            .addCase(createInstitute.rejected, (state, action) => {
                state.error = action.payload || 'Không thể tạo viện.';
            })
            .addCase(updateInstitute.fulfilled, (state, action) => {
                const updated = action.payload.data;
                const index = state.items.findIndex((d) => d.institute_id === updated.institute_id);
                if (index !== -1) {
                    state.items[index] = updated;
                }
            })
            .addCase(updateInstitute.rejected, (state, action) => {
                state.error = action.payload || 'Không thể cập nhật viện.';
            })
            .addCase(deleteInstitute.fulfilled, (state, action) => {
                state.items = state.items.filter((d) => d.institute_id !== action.payload.id);
            })
            .addCase(deleteInstitute.rejected, (state, action) => {
                state.error = action.payload || 'Không thể xóa viện.';
            });
    },
});

export const { setSelectedInstitute, clearError } = institutesSlice.actions;

export default institutesSlice.reducer;
