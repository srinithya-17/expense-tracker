import api from './api';

export const getIncomes = (params) => api.get('/income', { params }).then((r) => r.data);
export const getIncome = (id) => api.get(`/income/${id}`).then((r) => r.data.data);
export const createIncome = (data) => api.post('/income', data).then((r) => r.data.data);
export const updateIncome = (id, data) => api.put(`/income/${id}`, data).then((r) => r.data.data);
export const deleteIncome = (id) => api.delete(`/income/${id}`).then((r) => r.data);
