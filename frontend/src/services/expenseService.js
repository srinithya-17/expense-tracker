import api from './api';

const toFormData = (data) => {
  const fd = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) fd.append(key, value);
  });
  return fd;
};

export const getExpenses = (params) => api.get('/expenses', { params }).then((r) => r.data);
export const getExpense = (id) => api.get(`/expenses/${id}`).then((r) => r.data.data);
export const createExpense = (data) =>
  api
    .post('/expenses', toFormData(data), { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data.data);
export const updateExpense = (id, data) =>
  api
    .put(`/expenses/${id}`, toFormData(data), { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data.data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`).then((r) => r.data);
