import api from './axios';

export const reportApi = {
  dashboard: () => api.get('/reports/dashboard'),
  revenue: (params) => api.get('/reports/revenue', { params }),
  debtors: () => api.get('/reports/debtors'),
  lowStock: () => api.get('/reports/low-stock'),
  topLenses: (params) => api.get('/reports/top-lenses', { params }),
};
