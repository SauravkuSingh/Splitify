import axios from 'axios';

const getBaseURL = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  return url.endsWith('/api') || url.endsWith('/api/') ? url : `${url.replace(/\/$/, '')}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — har request mein token auto-attach
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('splitify_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — 401 pe auto-logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('splitify_token');
      localStorage.removeItem('splitify_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;