import API from './axios';

export const availabilityAPI = {
  // Get teacher's availability
  getMyAvailability: () => API.get('/availability/me'),
  
  // Create new availability slot
  createAvailability: (data) => API.post('/availability', data),
  
  // Update availability slot
  // Note: The API returns { success: true, data: availability }
  // axios interceptor unwraps it to just { success: true, data: availability }
  updateAvailability: (id, data) => API.put(`/availability/${id}`, data),
  
  // Delete availability slot
  deleteAvailability: (id) => API.delete(`/availability/${id}`),
  
  // Get available slots for students to book
  getAvailableSlots: (teacherId, subject, date) => 
    API.get(`/availability/slots/${teacherId}`, { params: { subject, date } })
};