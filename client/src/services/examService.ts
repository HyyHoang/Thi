import axiosClient from '../lib/api/axiosClient';
import { ExamPayload } from '../types';

const examService = {
    getAll: () => axiosClient.get('/exams'),
    getById: (id: string) => axiosClient.get(`/exams/${id}`),
    create: (payload: ExamPayload) => axiosClient.post('/exams', payload),
    update: (id: string, payload: Partial<ExamPayload>) => axiosClient.put(`/exams/${id}`, payload),
    remove: (id: string) => axiosClient.delete(`/exams/${id}`),
    getCurrentSemester: () => axiosClient.get('/exams/current-semester'),
    getSubjectsForSemester: (semesterId: string) =>
        axiosClient.get('/exams/subjects-for-semester', { params: { semester_id: semesterId } }),
    getBanksForSubject: (subjectId: string) =>
        axiosClient.get(`/exams/banks-for-subject/${subjectId}`),
};

export default examService;
