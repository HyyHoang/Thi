import axiosClient from '../lib/api/axiosClient';

const resultsService = {
    getAll: async () => {
        const response = await axiosClient.get('/results');
        return response.data;
    },
    getById: async (id: number | string) => {
        const response = await axiosClient.get(`/results/${id}`);
        return response.data;
    },
    getByAttempt: async (attemptId: number | string) => {
        const response = await axiosClient.get(`/results/by-attempt/${attemptId}`);
        return response.data;
    },
};

export default resultsService;
