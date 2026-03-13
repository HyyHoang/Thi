import axiosClient from '../api/axiosClient';

const departmentService = {
  getAll: () => axiosClient.get('/departments'),
  getById: (id) => axiosClient.get(`/departments/${id}`),
  create: (payload) => axiosClient.post('/departments', payload),
  update: (id, payload) => axiosClient.put(`/departments/${id}`, payload),
  remove: (id) => axiosClient.delete(`/departments/${id}`),
};

export default departmentService;

