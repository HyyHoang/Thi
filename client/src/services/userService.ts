import axiosClient from '../api/axiosClient';
import { UserPayload } from '../types';

const userService = {
    getAll: () => axiosClient.get('/users'),
    getById: (id: number) => axiosClient.get(`/users/${id}`),
    create: (payload: UserPayload) => axiosClient.post('/users', payload),
    update: (id: number, payload: UserPayload) => axiosClient.put(`/users/${id}`, payload),
    remove: (id: number) => axiosClient.delete(`/users/${id}`),
};

export default userService;
