import API from './axios';

export const appointmentsAPI = {
  // Student methods
  getStudentAppointments: () => API.get('/appointments/my'),
  bookAppointment: (data) => API.post('/appointments/book', data),
  
  // Teacher methods
  getTeacherAppointments: () => API.get('/appointments/my'),
  confirmAppointment: (id) => API.put(`/appointments/${id}/confirm`),
  completeAppointment: (id, data) => API.put(`/appointments/${id}/complete`, data),
  
  // Common methods
  cancelAppointment: (id, reason) => API.put(`/appointments/${id}/cancel`, { reason }),
  getAppointment: (id) => API.get(`/appointments/${id}`)
};