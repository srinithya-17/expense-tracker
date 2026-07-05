import api from './api';

export const updateProfile = (data) => api.put('/users/profile', data).then((r) => r.data.data);
export const changePassword = (data) => api.put('/users/change-password', data).then((r) => r.data);
export const updateAvatar = (file) => {
  const fd = new FormData();
  fd.append('avatar', file);
  return api
    .put('/users/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data.data);
};
