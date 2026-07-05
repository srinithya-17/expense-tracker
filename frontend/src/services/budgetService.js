import api from './api';

export const getBudgets = (month, year) =>
  api.get('/budgets', { params: { month, year } }).then((r) => r.data.data);
export const getBudgetHistory = () => api.get('/budgets/history').then((r) => r.data.data);
export const createBudget = (data) => api.post('/budgets', data).then((r) => r.data.data);
export const updateBudget = (id, data) => api.put(`/budgets/${id}`, data).then((r) => r.data.data);
export const deleteBudget = (id) => api.delete(`/budgets/${id}`).then((r) => r.data);
