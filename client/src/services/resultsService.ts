import axiosClient from '../lib/api/axiosClient';

const resultsService = {
    getAll: () => axiosClient.get('/results'),
    getById: (id: number | string) => axiosClient.get(`/results/${id}`),
    getByAttempt: (attemptId: number | string) => axiosClient.get(`/results/by-attempt/${attemptId}`),
};

export default resultsService;
