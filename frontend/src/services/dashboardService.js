import api from './api';

export const getSummary = () => api.get('/dashboard/summary').then((r) => r.data.data);
export const getAnalysis = (months) =>
  api.get('/dashboard/analysis', { params: { months } }).then((r) => r.data.data);
