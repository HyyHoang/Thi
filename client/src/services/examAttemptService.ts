import axiosClient from '../lib/api/axiosClient';
import { ExamAttemptPayload } from '../types';

const examAttemptService = {
    getAll: () => axiosClient.get('/exam-attempts'),
    getByExam: (examId: string) => axiosClient.get(`/exam-attempts/by-exam/${examId}`),
    getByStudent: (studentId: string) => axiosClient.get(`/exam-attempts/by-student/${studentId}`),
    getById: (id: number) => axiosClient.get(`/exam-attempts/${id}`),
    create: (payload: ExamAttemptPayload) => axiosClient.post('/exam-attempts', payload),
    update: (id: number, payload: ExamAttemptPayload) => axiosClient.put(`/exam-attempts/${id}`, payload),
    remove: (id: number) => axiosClient.delete(`/exam-attempts/${id}`),
};

export default examAttemptService;
