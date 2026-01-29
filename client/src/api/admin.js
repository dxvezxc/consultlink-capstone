// Admin API Client
// Handles all admin-related API calls

import axiosInstance from './axios';

const adminAPI = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await axiosInstance.get('/api/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get all users
  getAllUsers: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.role) params.append('role', filters.role);
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
      if (filters.search) params.append('search', filters.search);

      const response = await axiosInstance.get(`/api/admin/users?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Create user
  createUser: async (userData) => {
    try {
      const response = await axiosInstance.post('/api/admin/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (userId, userData) => {
    try {
      const response = await axiosInstance.put(`/api/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await axiosInstance.delete(`/api/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Get all consultations
  getAllConsultations: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.teacherId) params.append('teacherId', filters.teacherId);
      if (filters.studentId) params.append('studentId', filters.studentId);

      const response = await axiosInstance.get(`/api/admin/consultations?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching consultations:', error);
      throw error;
    }
  },

  // Get activity report
  getActivityReport: async (startDate, endDate) => {
    try {
      const response = await axiosInstance.get('/api/admin/reports/activity', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching activity report:', error);
      throw error;
    }
  },

  // Send broadcast notification
  sendBroadcastNotification: async (notificationData) => {
    try {
      const response = await axiosInstance.post('/api/admin/notifications/broadcast', notificationData);
      return response.data;
    } catch (error) {
      console.error('Error sending broadcast notification:', error);
      throw error;
    }
  },

  // Get top teachers
  getTopTeachers: async () => {
    try {
      const response = await axiosInstance.get('/api/admin/reports/top-teachers');
      return response.data;
    } catch (error) {
      console.error('Error fetching top teachers:', error);
      throw error;
    }
  },

  // Get system metrics
  getSystemMetrics: async () => {
    try {
      const response = await axiosInstance.get('/api/admin/metrics');
      return response.data;
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      throw error;
    }
  }
};

export default adminAPI;
