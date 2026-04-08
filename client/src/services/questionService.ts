import axiosClient from '../lib/api/axiosClient';
import { QuestionPayload } from '../types';

const questionService = {
    getAll: (params?: Record<string, any>) => axiosClient.get('/questions', { params }),
    getById: (id: string) => axiosClient.get(`/questions/${id}`),
    create: (payload: QuestionPayload) => axiosClient.post('/questions', payload),
    update: (id: string, payload: QuestionPayload) => axiosClient.put(`/questions/${id}`, payload),
    remove: (id: string) => axiosClient.delete(`/questions/${id}`),
    importCsv: ({ file, subjectId }: { file: File, subjectId?: string }) => {
        const formData = new FormData();
        formData.append('file', file);
        if (subjectId) {
            formData.append('subject_id', subjectId);
        }
        return axiosClient.post('/questions/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

export default questionService;
