// Consultations API Client
// Handles all consultation/appointment-related API calls
// NOTE: axios interceptor already returns response.data, so we just return the response

import axiosInstance from './axios';

// Request deduplication: store pending requests to avoid simultaneous duplicates
const pendingRequests = new Map();

/**
 * Deduplicate requests - if same request is in flight, return the same promise
 */
const deduplicateRequest = (key, requestFn) => {
  // If request already in flight, return existing promise
  if (pendingRequests.has(key)) {
    console.log(`[consultationsAPI] Returning cached request for: ${key}`);
    return pendingRequests.get(key);
  }
  
  // Execute request and store promise
  const promise = requestFn()
    .then(response => {
      // Remove from pending on success
      pendingRequests.delete(key);
      return response;
    })
    .catch(error => {
      // Remove from pending on error
      pendingRequests.delete(key);
      throw error;
    });
  
  // Store promise
  pendingRequests.set(key, promise);
  return promise;
};

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

  // Get user consultations/appointments - with deduplication
  getUserConsultations: async (filters = {}) => {
    const statusFilter = filters.status || 'all';
    const key = `getUserConsultations_${statusFilter}`;
    
    return deduplicateRequest(key, async () => {
      try {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);

        console.log('[consultationsAPI] Fetching user consultations with status:', statusFilter);
        const response = await axiosInstance.get(`/consultations?${params}`);
        console.log('[consultationsAPI] getUserConsultations response:', response);
        return response;
      } catch (error) {
        console.error('Error fetching user appointments:', error);
        throw error;
      }
    });
  },

  // Get all consultations (Admin) - with deduplication
  getAllConsultations: async (filters = {}) => {
    const statusFilter = filters.status || 'all';
    const roleFilter = filters.role || 'all';
    const key = `getAllConsultations_${statusFilter}_${roleFilter}`;
    
    return deduplicateRequest(key, async () => {
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
    });
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
      console.log('[consultationsAPI] Approving consultation:', consultationId);
      const response = await axiosInstance.put(`/consultations/${consultationId}/confirm`);
      console.log('[consultationsAPI] Approve response:', response);
      
      // Clear pending request cache on success to force refresh
      pendingRequests.delete('getUserConsultations_pending');
      pendingRequests.delete('getUserConsultations_all');
      
      return response;
    } catch (error) {
      console.error('Error approving consultation:', error);
      throw error;
    }
  },

  // Reject/Cancel consultation
  rejectConsultation: async (consultationId, reason = '') => {
    try {
      console.log('[consultationsAPI] Rejecting consultation:', consultationId);
      const response = await axiosInstance.put(`/consultations/${consultationId}/cancel`, { reason });
      console.log('[consultationsAPI] Reject response:', response);
      
      // Clear pending request cache on success to force refresh
      pendingRequests.delete('getUserConsultations_pending');
      pendingRequests.delete('getUserConsultations_all');
      
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
      
      // Clear cache on success
      pendingRequests.delete('getUserConsultations_pending');
      pendingRequests.delete('getUserConsultations_all');
      
      return response;
    } catch (error) {
      console.error('Error canceling consultation:', error);
      throw error;
    }
  },

  // Complete consultation
  completeConsultation: async (consultationId, completionData = {}) => {
    try {
      console.log('[consultationsAPI] Completing consultation:', consultationId);
      const response = await axiosInstance.put(
        `/consultations/${consultationId}/complete`,
        completionData
      );
      console.log('[consultationsAPI] Complete response:', response);
      
      // Clear cache on success
      pendingRequests.delete('getUserConsultations_pending');
      pendingRequests.delete('getUserConsultations_all');
      
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
      
      // Clear cache on success
      pendingRequests.delete('getUserConsultations_pending');
      pendingRequests.delete('getUserConsultations_all');
      
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
  },

  /**
   * Clear request cache - useful when you know data has changed
   */
  clearCache: (key) => {
    if (key) {
      pendingRequests.delete(key);
      console.log(`[consultationsAPI] Cleared cache for: ${key}`);
    } else {
      pendingRequests.clear();
      console.log('[consultationsAPI] Cleared all request cache');
    }
  }
};

export default consultationsAPI;
export { deduplicateRequest };
