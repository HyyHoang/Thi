import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../../lib/api/axiosClient';
import { ApiListResponse, ApiSingleResponse, Institute, InstitutePayload } from '../../../types';

export const fetchInstitutes = createAsyncThunk<
    ApiListResponse<Institute>,
    void,
    { rejectValue: string }
>('institutes/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosClient.get('/institutes');
        return response as unknown as ApiListResponse<Institute>;
    } catch (error: any) {
        const message = error?.response?.data?.message || 'Không thể tải danh sách viện.';
        return rejectWithValue(message);
    }
});

export const createInstitute = createAsyncThunk<
    ApiSingleResponse<Institute>,
    InstitutePayload,
    { rejectValue: string }
>('institutes/create', async (payload, { rejectWithValue }) => {
    try {
        const response = await axiosClient.post('/institutes', payload);
        return response as unknown as ApiSingleResponse<Institute>;
    } catch (error: any) {
        const message = error?.response?.data?.message || 'Không thể tạo viện.';
        return rejectWithValue(message);
    }
});

export const updateInstitute = createAsyncThunk<
    ApiSingleResponse<Institute>,
    { id: string; payload: InstitutePayload },
    { rejectValue: string }
>('institutes/update', async ({ id, payload }, { rejectWithValue }) => {
    try {
        const response = await axiosClient.put(`/institutes/${id}`, payload);
        return response as unknown as ApiSingleResponse<Institute>;
    } catch (error: any) {
        const message = error?.response?.data?.message || 'Không thể cập nhật viện.';
        return rejectWithValue(message);
    }
});

export const deleteInstitute = createAsyncThunk<
    { id: string },
    string,
    { rejectValue: string }
>('institutes/delete', async (id, { rejectWithValue }) => {
    try {
        await axiosClient.delete(`/institutes/${id}`);
        return { id };
    } catch (error: any) {
        const message = error?.response?.data?.message || 'Không thể xóa viện.';
        return rejectWithValue(message);
    }
});
