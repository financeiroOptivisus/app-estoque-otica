import api from './axios';

export const frameApi = {
  list: (params) => api.get('/frames', { params }),
  get: (id) => api.get(`/frames/${id}`),
  create: (data) => api.post('/frames', data),
  update: (id, data) => api.put(`/frames/${id}`, data),
  remove: (id) => api.delete(`/frames/${id}`),
};
