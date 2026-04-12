import axiosClient from '../lib/api/axiosClient';

const studentExamService = {
    getMyExams: () => axiosClient.get('/student/exams'),
    getMyProfile: () => axiosClient.get('/student/profile'),
};

export default studentExamService;
