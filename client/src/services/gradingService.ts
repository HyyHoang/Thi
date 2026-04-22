import axiosClient from '../lib/api/axiosClient';

const gradingService = {
  getPending: async (status: number = 0) => {
    const response = await axiosClient.get(`/grading/pending?is_graded=${status}`);
    return response;
  },

  getDetail: async (resultId: number | string) => {
    const response = await axiosClient.get(`/grading/${resultId}`);
    return response;
  },

  submitGrade: async (resultId: number | string, answers: { id: number, score: number }[]) => {
    const response = await axiosClient.post(`/grading/${resultId}`, { answers });
    return response;
  },

  triggerAIGrading: async (answerId: number | string) => {
    const response = await axiosClient.post(`/grading/ai-grade-answer/${answerId}`);
    return response;
  }
};

export default gradingService;
