import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import departmentService from '../../services/departmentService';
import { ApiListResponse, ApiSingleResponse, Department, DepartmentPayload } from '../../types';

export interface DepartmentsState {
    items: Department[];
    selected?: Department | null;
    loading: boolean;
    error?: string | null;
}

const initialState: DepartmentsState = {
    items: [],
    selected: null,
    loading: false,
    error: null,
};

export const fetchDepartments = createAsyncThunk<
    ApiListResponse<Department>,
    void,
    { rejectValue: string }
>('departments/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await departmentService.getAll();
        return response as ApiListResponse<Department>;
    } catch (error: any) {
        const message = error?.response?.data?.message || 'Không thể tải danh sách khoa.';
        return rejectWithValue(message);
    }
});

export const createDepartment = createAsyncThunk<
    ApiSingleResponse<Department>,
    DepartmentPayload,
    { rejectValue: string }
>('departments/create', async (payload, { rejectWithValue }) => {
    try {
        const response = await departmentService.create(payload);
        return response as ApiSingleResponse<Department>;
    } catch (error: any) {
        const message = error?.response?.data?.message || 'Không thể tạo khoa.';
        return rejectWithValue(message);
    }
});

export const updateDepartment = createAsyncThunk<
    ApiSingleResponse<Department>,
    { id: number; payload: DepartmentPayload },
    { rejectValue: string }
>('departments/update', async ({ id, payload }, { rejectWithValue }) => {
    try {
        const response = await departmentService.update(id, payload);
        return response as ApiSingleResponse<Department>;
    } catch (error: any) {
        const message = error?.response?.data?.message || 'Không thể cập nhật khoa.';
        return rejectWithValue(message);
    }
});

export const deleteDepartment = createAsyncThunk<
    { id: number },
    number,
    { rejectValue: string }
>('departments/delete', async (id, { rejectWithValue }) => {
    try {
        await departmentService.remove(id);
        return { id };
    } catch (error: any) {
        const message = error?.response?.data?.message || 'Không thể xóa khoa.';
        return rejectWithValue(message);
    }
});

const departmentsSlice = createSlice({
    name: 'departments',
    initialState,
    reducers: {
        setSelectedDepartment(state, action: PayloadAction<Department | null>) {
            state.selected = action.payload;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDepartments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDepartments.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
            })
            .addCase(fetchDepartments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Không thể tải danh sách khoa.';
            })
            .addCase(createDepartment.pending, (state) => {
                state.error = null;
            })
            .addCase(createDepartment.fulfilled, (state, action) => {
                state.items.push(action.payload.data);
            })
            .addCase(createDepartment.rejected, (state, action) => {
                state.error = action.payload || 'Không thể tạo khoa.';
            })
            .addCase(updateDepartment.fulfilled, (state, action) => {
                const updated = action.payload.data;
                const index = state.items.findIndex((d) => d.department_id === updated.department_id);
                if (index !== -1) {
                    state.items[index] = updated;
                }
            })
            .addCase(updateDepartment.rejected, (state, action) => {
                state.error = action.payload || 'Không thể cập nhật khoa.';
            })
            .addCase(deleteDepartment.fulfilled, (state, action) => {
                state.items = state.items.filter((d) => d.department_id !== action.payload.id);
            })
            .addCase(deleteDepartment.rejected, (state, action) => {
                state.error = action.payload || 'Không thể xóa khoa.';
            });
    },
});

export const { setSelectedDepartment, clearError } = departmentsSlice.actions;

export default departmentsSlice.reducer;

