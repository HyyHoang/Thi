import axiosClient from '../api/axiosClient';

const authService = {
  login: (username, password) =>
    axiosClient.post('/auth/login', { username, password }),

  logout: () => axiosClient.post('/auth/logout'),

  getMe: () => axiosClient.get('/auth/me'),
};

export default authService;
