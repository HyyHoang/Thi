import axiosClient from '../api/axiosClient';
import { QuestionPayload } from '../types';

const questionService = {
    getAll: (params?: Record<string, any>) => axiosClient.get('/questions', { params }),
    getById: (id: string) => axiosClient.get(`/questions/${id}`),
    create: (payload: QuestionPayload) => axiosClient.post('/questions', payload),
    update: (id: string, payload: QuestionPayload) => axiosClient.put(`/questions/${id}`, payload),
    remove: (id: string) => axiosClient.delete(`/questions/${id}`),
    importCsv: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return axiosClient.post('/questions/import', formData);
    },
};

export default questionService;
