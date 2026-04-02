import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../../lib/api/axiosClient';
import { ApiListResponse, ApiSingleResponse, Exam, ExamPayload } from '../../../types';

export const fetchExams = createAsyncThunk<
    ApiListResponse<Exam>,
    void,
    { rejectValue: string }
>('exams/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response: any = await axiosClient.get('/exams');
        return response.data ? response : { data: response };
    } catch (error: any) {
        return rejectWithValue(error?.response?.data?.message || 'Không thể tải danh sách đề thi.');
    }
});

export const fetchExamById = createAsyncThunk<
    ApiSingleResponse<Exam>,
    string,
    { rejectValue: string }
>('exams/fetchById', async (id, { rejectWithValue }) => {
    try {
        const response: any = await axiosClient.get(`/exams/${id}`);
        return response.data ? response : { data: response };
    } catch (error: any) {
        return rejectWithValue(error?.response?.data?.message || 'Không thể tải chi tiết đề thi.');
    }
});

export const createExam = createAsyncThunk<
    ApiSingleResponse<Exam>,
    ExamPayload,
    { rejectValue: string }
>('exams/create', async (payload, { rejectWithValue }) => {
    try {
        const response: any = await axiosClient.post('/exams', payload);
        return response.data ? response : { data: response };
    } catch (error: any) {
        return rejectWithValue(error?.response?.data?.message || 'Không thể tạo đề thi.');
    }
});

export const updateExam = createAsyncThunk<
    ApiSingleResponse<Exam>,
    { id: string; payload: Partial<ExamPayload> },
    { rejectValue: string }
>('exams/update', async ({ id, payload }, { rejectWithValue }) => {
    try {
        const response: any = await axiosClient.put(`/exams/${id}`, payload);
        return response.data ? response : { data: response };
    } catch (error: any) {
        return rejectWithValue(error?.response?.data?.message || 'Không thể cập nhật đề thi.');
    }
});

export const deleteExam = createAsyncThunk<
    { id: string },
    string,
    { rejectValue: string }
>('exams/delete', async (id, { rejectWithValue }) => {
    try {
        await axiosClient.delete(`/exams/${id}`);
        return { id };
    } catch (error: any) {
        return rejectWithValue(error?.response?.data?.message || 'Không thể xóa đề thi.');
    }
});
