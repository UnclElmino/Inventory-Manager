import api from './api';

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data; // null or user object
};

export const logout = async () => {
  await api.post('/auth/logout');
};
