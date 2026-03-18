import axiosClient from '../api/axiosClient';
import { LoginCredentials } from '../types';

const authService = {
    login: (username: string, password: string) =>
        axiosClient.post<LoginCredentials>('/auth/login', { username, password }),

    logout: () => axiosClient.post('/auth/logout'),

    getMe: () => axiosClient.get('/auth/me'),
};

export default authService;
