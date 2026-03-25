import axiosClient from '../api/axiosClient';
import { SemesterPayload } from '../types';

const semesterService = {
    getAll: () => axiosClient.get('/semesters'),
    getById: (id: string) => axiosClient.get(`/semesters/${id}`),
    create: (payload: SemesterPayload) => axiosClient.post('/semesters', payload),
    update: (id: string, payload: SemesterPayload) => axiosClient.put(`/semesters/${id}`, payload),
    remove: (id: string) => axiosClient.delete(`/semesters/${id}`),
};

export default semesterService;
