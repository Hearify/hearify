import axios from 'axios';

import { BACKEND_URL } from '@src/constants';
import { useAuthStore } from '@src/store/auth';

axios.defaults.baseURL = BACKEND_URL;

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('@token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const { isLoggedIn, logout } = useAuthStore.getState();
    if (error.response?.status === 401 && isLoggedIn) {
      logout();
    }
    return Promise.reject(error);
  }
);

export default axios;
