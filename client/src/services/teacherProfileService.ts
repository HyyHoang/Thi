import axiosClient from '../api/axiosClient';
import { TeacherProfilePayload } from '../types';

const teacherProfileService = {
    // Admin routes
    getAll: () => axiosClient.get('/teachers'),
    getById: (id: number) => axiosClient.get(`/teachers/${id}`),
    create: (payload: TeacherProfilePayload) => axiosClient.post('/teachers', payload),
    update: (id: number, payload: TeacherProfilePayload) => axiosClient.put(`/teachers/${id}`, payload),
    remove: (id: number) => axiosClient.delete(`/teachers/${id}`),

    // Teacher self routes
    getMyProfile: () => axiosClient.get('/profile/me'),
    updateMyProfile: (payload: Partial<TeacherProfilePayload>) => axiosClient.put('/profile/me', payload),
};

export default teacherProfileService;
