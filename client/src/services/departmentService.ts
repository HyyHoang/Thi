import axiosClient from '../lib/api/axiosClient';
import { DepartmentPayload } from '../types';

const departmentService = {
    getAll: () => axiosClient.get('/departments'),
    getById: (id: string) => axiosClient.get(`/departments/${id}`),
    create: (payload: DepartmentPayload) => axiosClient.post('/departments', payload),
    update: (id: string, payload: DepartmentPayload) => axiosClient.put(`/departments/${id}`, payload),
    remove: (id: string) => axiosClient.delete(`/departments/${id}`),
};

export default departmentService;
