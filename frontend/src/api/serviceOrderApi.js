import api from './axios';

export const serviceOrderApi = {
  list: (params) => api.get('/service-orders', { params }),
  get: (id) => api.get(`/service-orders/${id}`),
  print: (id) => api.get(`/service-orders/${id}/print`),
  create: (data) => api.post('/service-orders', data),
  update: (id, data) => api.put(`/service-orders/${id}`, data),
  updateStatus: (id, status) => api.patch(`/service-orders/${id}/status`, { status }),
};
