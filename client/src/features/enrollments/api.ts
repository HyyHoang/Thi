import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../lib/api/axiosClient';
import { EnrollmentState } from './types';

const API_URL = '/enrollments';

export const fetchEnrollments = createAsyncThunk(
  'enrollments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(API_URL);
      // axiosClient interceptor trả về response.data (tức là body JSON {success, data, ...})
      return (response as any).data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Error fetching enrollments');
    }
  }
);

export const createEnrollment = createAsyncThunk(
  'enrollments/create',
  async (data: { SectionID: string; StudentID: string }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(API_URL, data);
      return (response as any).data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Error creating enrollment');
    }
  }
);

export const updateEnrollment = createAsyncThunk(
  'enrollments/update',
  async ({ id, Status }: { id: string; Status: number }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(`${API_URL}/${id}`, { Status });
      return (response as any).data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Error updating enrollment');
    }
  }
);

export const deleteEnrollment = createAsyncThunk(
  'enrollments/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`${API_URL}/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Error deleting enrollment');
    }
  }
);

const initialState: EnrollmentState = {
  enrollments: [],
  loading: false,
  error: null,
};

const enrollmentSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnrollments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments = action.payload;
      })
      .addCase(fetchEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createEnrollment.fulfilled, (state, action) => {
        state.enrollments.push(action.payload);
      })
      .addCase(updateEnrollment.fulfilled, (state, action) => {
        const index = state.enrollments.findIndex(e => e.EnrollmentID === action.payload.EnrollmentID);
        if (index !== -1) {
          state.enrollments[index] = action.payload;
        }
      })
      .addCase(deleteEnrollment.fulfilled, (state, action) => {
        state.enrollments = state.enrollments.filter(e => e.EnrollmentID !== action.payload);
      });
  },
});

export default enrollmentSlice.reducer;
