import axiosClient from '../api/axiosClient';
import { DepartmentPayload } from '../types';

const departmentService = {
    getAll: () => axiosClient.get('/departments'),
    getById: (id: number) => axiosClient.get(`/departments/${id}`),
    create: (payload: DepartmentPayload) => axiosClient.post('/departments', payload),
    update: (id: number, payload: DepartmentPayload) => axiosClient.put(`/departments/${id}`, payload),
    remove: (id: number) => axiosClient.delete(`/departments/${id}`),
};

export default departmentService;
