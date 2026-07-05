import api from './api';

export const getTransactions = (params) => api.get('/transactions', { params }).then((r) => r.data);
export const exportCSVUrl = () => `${api.defaults.baseURL}/transactions/export/csv`;
