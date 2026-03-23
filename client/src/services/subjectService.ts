import axiosClient from '../api/axiosClient';
import { SubjectPayload } from '../types';

const subjectService = {
    getAll: () => axiosClient.get('/subjects'),
    getById: (id: string) => axiosClient.get(`/subjects/${id}`),
    create: (payload: SubjectPayload) => axiosClient.post('/subjects', payload),
    update: (id: string, payload: SubjectPayload) => axiosClient.put(`/subjects/${id}`, payload),
    remove: (id: string) => axiosClient.delete(`/subjects/${id}`),
};

export default subjectService;
