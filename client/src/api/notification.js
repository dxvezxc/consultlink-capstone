// Notification API Client
// Handles all notification-related API calls

import axiosInstance from './axios';

const notificationAPI = {
  // Get user notifications
  getNotifications: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.isRead !== undefined) params.append('isRead', filters.isRead);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await axiosInstance.get(`/api/notifications?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Get notification by ID
  getNotificationById: async (notificationId) => {
    try {
      const response = await axiosInstance.get(`/api/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await axiosInstance.patch(`/api/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await axiosInstance.patch('/api/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await axiosInstance.delete(`/api/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Delete all notifications
  deleteAllNotifications: async () => {
    try {
      const response = await axiosInstance.delete('/api/notifications/all');
      return response.data;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await axiosInstance.get('/api/notifications/unread-count');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  // Get notifications by type
  getNotificationsByType: async (type) => {
    try {
      const response = await axiosInstance.get(`/api/notifications/type/${type}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications by type:', error);
      throw error;
    }
  },

  // Clear old notifications (older than specified days)
  clearOldNotifications: async (daysOld = 30) => {
    try {
      const response = await axiosInstance.delete('/api/notifications/clear-old', {
        data: { daysOld }
      });
      return response.data;
    } catch (error) {
      console.error('Error clearing old notifications:', error);
      throw error;
    }
  }
};

export default notificationAPI;
