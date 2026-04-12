import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../../lib/api/axiosClient';
import { LoginCredentials } from '../types';

// The return type is typically any for now, or AuthResponse wrapper if properly typed
export const loginThunk = createAsyncThunk(
    'auth/login',
    async (credentials: LoginCredentials, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post('/auth/login', credentials);
            return response as any; // The interceptor returns the data object, this needs checking based on app behavior
        } catch (error: any) {
             return rejectWithValue(
                error.response?.data?.errors?.username?.[0] || 
                error.response?.data?.message || 
                error.message || 
                'Login failed'
            );
        }
    }
);

export const logoutThunk = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post('/auth/logout');
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const getMeThunk = createAsyncThunk(
    'auth/getMe',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get('/auth/me');
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);
