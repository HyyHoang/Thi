import axiosClient from '../lib/api/axiosClient';
import { UserPayload } from '../types';

const userService = {
    getAll: () => axiosClient.get('/users'),
    getById: (id: string) => axiosClient.get(`/users/${id}`),
    create: (payload: UserPayload) => axiosClient.post('/users', payload),
    update: (id: string, payload: UserPayload) => axiosClient.put(`/users/${id}`, payload),
    remove: (id: string) => axiosClient.delete(`/users/${id}`),
};

export default userService;
