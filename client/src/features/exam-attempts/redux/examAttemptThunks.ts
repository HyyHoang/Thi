import { createAsyncThunk } from '@reduxjs/toolkit';
import { ExamAttempt, ExamAttemptPayload } from '../../../types';
import examAttemptService from '../../../services/examAttemptService';

export const fetchExamAttempts = createAsyncThunk<ExamAttempt[], void, { rejectValue: string }>(
  'examAttempts/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response: any = await examAttemptService.getAll();
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Không thể tải danh sách lượt làm bài');
    }
  }
);

export const createExamAttempt = createAsyncThunk<ExamAttempt, ExamAttemptPayload, { rejectValue: string }>(
  'examAttempts/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response: any = await examAttemptService.create(payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi khi tạo lượt làm bài');
    }
  }
);

export const updateExamAttempt = createAsyncThunk<
  ExamAttempt,
  { id: number; payload: ExamAttemptPayload },
  { rejectValue: string }
>(
  'examAttempts/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response: any = await examAttemptService.update(id, payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi khi cập nhật lượt làm bài');
    }
  }
);

export const deleteExamAttempt = createAsyncThunk<number, number, { rejectValue: string }>(
  'examAttempts/delete',
  async (id, { rejectWithValue }) => {
    try {
      await examAttemptService.remove(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi khi xóa lượt làm bài');
    }
  }
);
