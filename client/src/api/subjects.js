import API from './axios';

export const subjectsAPI = {
  getAll: () => API.get('/subjects'),
  getById: (id) => API.get(`/subjects/${id}`),
  getWithConsultants: () => API.get('/subjects')
};