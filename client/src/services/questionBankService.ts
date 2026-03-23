import axiosClient from '../api/axiosClient';
import { QuestionBankCreatePayload, QuestionBankPayload, QuestionChapterPayload } from '../types';

const questionBankService = {
    getAll: () => axiosClient.get('/question-banks'),
    getById: (id: string) => axiosClient.get(`/question-banks/${id}`),
    create: (payload: QuestionBankCreatePayload) => axiosClient.post('/question-banks', payload),
    update: (id: string, payload: QuestionBankPayload) =>
        axiosClient.put(`/question-banks/${id}`, payload),
    remove: (id: string) => axiosClient.delete(`/question-banks/${id}`),
    createChapter: (bankId: string, payload: QuestionChapterPayload) =>
        axiosClient.post(`/question-banks/${bankId}/chapters`, payload),
    updateChapter: (bankId: string, chapterId: number, payload: Partial<QuestionChapterPayload>) =>
        axiosClient.put(`/question-banks/${bankId}/chapters/${chapterId}`, payload),
    removeChapter: (bankId: string, chapterId: number) =>
        axiosClient.delete(`/question-banks/${bankId}/chapters/${chapterId}`),
};

export default questionBankService;
