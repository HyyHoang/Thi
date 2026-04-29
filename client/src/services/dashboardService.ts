import axiosClient from '../lib/api/axiosClient';

const dashboardService = {
    getExams: () => axiosClient.get('/dashboard/exams'),
    getExamStats: () => axiosClient.get('/dashboard/exam-stats'),
    
    getStudentExams: () => axiosClient.get('/student/dashboard/exams'),
    getStudentStats: () => axiosClient.get('/student/dashboard/stats'),
};

export default dashboardService;
