import api from './axios';

export const lensApi = {
  list: (params) => api.get('/lenses', { params }),
  get: (id) => api.get(`/lenses/${id}`),
  create: (data) => api.post('/lenses', data),
  update: (id, data) => api.put(`/lenses/${id}`, data),
  adjustStock: (id, delta) => api.patch(`/lenses/${id}/stock`, { delta }),
  remove: (id) => api.delete(`/lenses/${id}`),
};
