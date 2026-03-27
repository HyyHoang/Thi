import axiosClient from '../api/axiosClient';
import { StudentProfile, StudentProfilePayload } from '../types';

export const studentProfileService = {
    getAll: async (): Promise<StudentProfile[]> => {
        const response = await axiosClient.get('/student-profiles');
        return response as any;
    },

    getById: async (id: string): Promise<StudentProfile> => {
        const response = await axiosClient.get(`/student-profiles/${id}`);
        return response as any;
    },

    create: async (payload: StudentProfilePayload): Promise<StudentProfile> => {
        const response = await axiosClient.post('/student-profiles', payload);
        return response as any;
    },

    update: async (id: string, payload: Partial<StudentProfilePayload>): Promise<StudentProfile> => {
        const response = await axiosClient.put(`/student-profiles/${id}`, payload);
        return response as any;
    },

    delete: async (id: string): Promise<void> => {
        await axiosClient.delete(`/student-profiles/${id}`);
    },
};
