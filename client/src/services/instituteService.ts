import axiosClient from '../api/axiosClient';
import { InstitutePayload } from '../types';

const instituteService = {
    getAll: () => axiosClient.get('/institutes'),
    getById: (id: number) => axiosClient.get(`/institutes/${id}`),
    create: (payload: InstitutePayload) => axiosClient.post('/institutes', payload),
    update: (id: number, payload: InstitutePayload) => axiosClient.put(`/institutes/${id}`, payload),
    remove: (id: number) => axiosClient.delete(`/institutes/${id}`),
};

export default instituteService;
