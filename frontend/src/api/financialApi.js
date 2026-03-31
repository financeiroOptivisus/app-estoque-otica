import api from './axios';

export const financialApi = {
  list: (params) => api.get('/financial', { params }),
  get: (id) => api.get(`/financial/${id}`),
  create: (data) => api.post('/financial', data),
  update: (id, data) => api.put(`/financial/${id}`, data),
  payInstallment: (id, installmentId, data) =>
    api.post(`/financial/${id}/installments/${installmentId}/pay`, data),
};
