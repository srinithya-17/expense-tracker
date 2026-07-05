import api from './api';

export const register = (data) => api.post('/auth/register', data).then((r) => r.data.data);
export const login = (data) => api.post('/auth/login', data).then((r) => r.data.data);
export const getMe = () => api.get('/auth/me').then((r) => r.data.data);
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email }).then((r) => r.data);
export const resetPassword = (resetToken, password) =>
  api.put(`/auth/reset-password/${resetToken}`, { password }).then((r) => r.data.data);
