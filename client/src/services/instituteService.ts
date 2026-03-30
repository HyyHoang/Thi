import axiosClient from '../lib/api/axiosClient';
import { InstitutePayload } from '../types';

const instituteService = {
    getAll: () => axiosClient.get('/institutes'),
    getById: (id: string) => axiosClient.get(`/institutes/${id}`),
    create: (payload: InstitutePayload) => axiosClient.post('/institutes', payload),
    update: (id: string, payload: InstitutePayload) => axiosClient.put(`/institutes/${id}`, payload),
    remove: (id: string) => axiosClient.delete(`/institutes/${id}`),
};

export default instituteService;
