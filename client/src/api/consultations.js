// Consultations API Client
// Handles all consultation/appointment-related API calls
// NOTE: axios interceptor already returns response.data, so we just return the response

import axiosInstance from './axios';

const consultationsAPI = {
  // Create consultation/appointment
  createConsultation: async (appointmentData) => {
    try {
      const response = await axiosInstance.post('/consultations', appointmentData);
      return response;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  // Get user consultations/appointments
  getUserConsultations: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);

      const response = await axiosInstance.get(`/consultations?${params}`);
      console.log('[consultationsAPI] getUserConsultations response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching user appointments:', error);
      throw error;
    }
  },

  // Get all consultations (Admin)
  getAllConsultations: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.role) params.append('role', filters.role);

      const response = await axiosInstance.get(`/consultations/all?${params}`);
      return response;
    } catch (error) {
      console.error('Error fetching all consultations:', error);
      throw error;
    }
  },

  // Get consultation by ID
  getConsultationById: async (consultationId) => {
    try {
      const response = await axiosInstance.get(`/consultations/${consultationId}`);
      return response;
    } catch (error) {
      console.error('Error fetching consultation:', error);
      throw error;
    }
  },

  // Confirm/Approve consultation
  approveConsultation: async (consultationId) => {
    try {
      const response = await axiosInstance.put(`/consultations/${consultationId}/confirm`);
      return response;
    } catch (error) {
      console.error('Error approving consultation:', error);
      throw error;
    }
  },

  // Reject/Cancel consultation
  rejectConsultation: async (consultationId, reason = '') => {
    try {
      const response = await axiosInstance.put(`/consultations/${consultationId}/cancel`, { reason });
      return response;
    } catch (error) {
      console.error('Error rejecting consultation:', error);
      throw error;
    }
  },

  // Cancel consultation
  cancelConsultation: async (consultationId, reason = '') => {
    try {
      const response = await axiosInstance.put(`/consultations/${consultationId}/cancel`, { reason });
      return response;
    } catch (error) {
      console.error('Error canceling consultation:', error);
      throw error;
    }
  },

  // Complete consultation
  completeConsultation: async (consultationId, completionData = {}) => {
    try {
      const response = await axiosInstance.put(
        `/consultations/${consultationId}/complete`,
        completionData
      );
      return response;
    } catch (error) {
      console.error('Error completing consultation:', error);
      throw error;
    }
  },

  // Delete consultation
  deleteConsultation: async (consultationId) => {
    try {
      const response = await axiosInstance.delete(`/consultations/${consultationId}`);
      return response;
    } catch (error) {
      console.error('Error deleting consultation:', error);
      throw error;
    }
  },

  // Get available slots for teacher
  getAvailableSlots: async (teacherId, subjectId, date) => {
    try {
      const response = await axiosInstance.get('/availability/slots', {
        params: { teacherId, subjectId, date }
      });
      return response;
    } catch (error) {
      console.error('Error fetching available slots:', error);
      throw error;
    }
  },

  // Get booked time slots for a teacher on a specific date
  getBookedSlots: async (teacherId, date) => {
    try {
      const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
      const response = await axiosInstance.get(`/consultations/booked/${teacherId}/${dateStr}`);
      return response;
    } catch (error) {
      console.error('Error fetching booked slots:', error);
      throw error;
    }
  }
};

export default consultationsAPI;
