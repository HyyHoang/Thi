import axiosClient from '../lib/api/axiosClient';
import { TeacherProfilePayload } from '../types';

const teacherProfileService = {
    // Admin routes
    getAll: () => axiosClient.get('/teachers'),
    getById: (id: string) => axiosClient.get(`/teachers/${id}`),
    create: (payload: TeacherProfilePayload) => axiosClient.post('/teachers', payload),
    update: (id: string, payload: TeacherProfilePayload) => axiosClient.put(`/teachers/${id}`, payload),
    remove: (id: string) => axiosClient.delete(`/teachers/${id}`),

    // Teacher self routes
    getMyProfile: () => axiosClient.get('/profile/me'),
    updateMyProfile: (payload: Partial<TeacherProfilePayload>) => axiosClient.put('/profile/me', payload),
};

export default teacherProfileService;
