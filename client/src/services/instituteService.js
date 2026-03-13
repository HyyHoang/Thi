import axiosClient from '../api/axiosClient';

const instituteService = {
  getAll: () => axiosClient.get('/institutes'),
  getById: (id) => axiosClient.get(`/institutes/${id}`),
  create: (payload) => axiosClient.post('/institutes', payload),
  update: (id, payload) => axiosClient.put(`/institutes/${id}`, payload),
  remove: (id) => axiosClient.delete(`/institutes/${id}`),
};

export default instituteService;

