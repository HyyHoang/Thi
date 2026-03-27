import axiosClient from '../api/axiosClient';
import { CourseSectionPayload } from '../types';

const courseSectionService = {
    getAll: () => axiosClient.get('/course-sections'),
    getById: (id: string) => axiosClient.get(`/course-sections/${id}`),
    create: (payload: CourseSectionPayload) => axiosClient.post('/course-sections', payload),
    update: (id: string, payload: CourseSectionPayload) => axiosClient.put(`/course-sections/${id}`, payload),
    remove: (id: string) => axiosClient.delete(`/course-sections/${id}`),
};

export default courseSectionService;
