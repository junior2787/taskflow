import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateMe: (data: { name?: string; avatar?: string }) =>
    api.put('/auth/me', data),
};

export const tasksApi = {
  list: (params?: {
    status?: string;
    priority?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }) => api.get('/tasks', { params }),
  stats: () => api.get('/tasks/stats'),
  create: (data: {
    title: string;
    description?: string;
    priority?: string;
    dueDate?: string | null;
  }) => api.post('/tasks', data),
  get: (id: string) => api.get(`/tasks/${id}`),
  update: (id: string, data: Partial<{
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string | null;
  }>) => api.put(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

export const usersApi = {
  search: (q: string) => api.get('/users/search', { params: { q } }),
  get: (id: string) => api.get(`/users/${id}`),
};