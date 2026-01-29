import API from './axios';

export const teachersAPI = {
  getAll: () => API.get('/users/teachers/all'),
  getById: (id) => API.get(`/users/${id}`),
  getTeacherSubjects: (id) => API.get(`/users/${id}/subjects`)
};
