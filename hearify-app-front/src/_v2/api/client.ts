import axios from 'axios';

import { useAuthStore } from '@src/store/auth';

const client = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

/* eslint-disable no-param-reassign, @typescript-eslint/no-unsafe-member-access */
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('@token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const { isLoggedIn, logout } = useAuthStore.getState();
    if (error.response?.status === 401 && isLoggedIn) {
      logout();
    }
    return Promise.reject(error);
  }
);

export default client;
