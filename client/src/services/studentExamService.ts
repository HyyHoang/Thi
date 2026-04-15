import axiosClient from '../lib/api/axiosClient';

const studentExamService = {
    getMyExams: () => axiosClient.get('/student/exams'),
    getExamHistory: () => axiosClient.get('/student/exam-history'),
    getMyProfile: () => axiosClient.get('/student/profile'),
    updateMyProfile: (payload: any) => axiosClient.put('/student/profile', payload),
    verifyPassword: (id: string, payload: { password: string }) => axiosClient.post(`/student/exams/${id}/verify-password`, payload),
    takeExam: (id: string) => axiosClient.get(`/student/exams/${id}/take`),
    submitExam: (id: string, payload: { answers: Record<string, string> }) => axiosClient.post(`/student/exams/${id}/submit`, payload),
};

export default studentExamService;
