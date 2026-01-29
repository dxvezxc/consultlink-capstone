// Notification Service
// Handles sending notifications to users

const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  // Send notification to a user
  static async sendNotification(userId, type, title, message, relatedId = null, actionUrl = null) {
    try {
      const notification = await Notification.create({
        user: userId,
        type,
        title,
        message,
        relatedId,
        actionUrl,
        isRead: false
      });

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }

  // Send notification to multiple users
  static async sendBulkNotification(userIds, type, title, message, relatedId = null) {
    try {
      const notifications = userIds.map(userId => ({
        user: userId,
        type,
        title,
        message,
        relatedId,
        isRead: false
      }));

      const result = await Notification.insertMany(notifications);
      return result;
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      return [];
    }
  }

  // Send consultation approved notification
  static async notifyConsultationApproved(consultationId, studentId, teacherId) {
    try {
      await this.sendNotification(
        studentId,
        'consultation_approved',
        'Consultation Approved',
        'Your consultation request has been approved by the teacher.',
        consultationId,
        `/consultations/${consultationId}`
      );

      await this.sendNotification(
        teacherId,
        'consultation_approved',
        'Consultation Approved',
        'You have approved a consultation request.',
        consultationId,
        `/consultations/${consultationId}`
      );
    } catch (error) {
      console.error('Error notifying consultation approval:', error);
    }
  }

  // Send consultation rejection notification
  static async notifyConsultationRejected(consultationId, studentId, reason = '') {
    try {
      const message = reason 
        ? `Your consultation request has been rejected. Reason: ${reason}`
        : 'Your consultation request has been rejected.';

      await this.sendNotification(
        studentId,
        'consultation_rejected',
        'Consultation Rejected',
        message,
        consultationId
      );
    } catch (error) {
      console.error('Error notifying consultation rejection:', error);
    }
  }

  // Send consultation reminder
  static async sendConsultationReminder(consultationId, studentId, teacherId, hoursBeforeStart = 24) {
    try {
      const message = `You have an upcoming consultation in ${hoursBeforeStart} hours.`;

      await this.sendNotification(
        studentId,
        'consultation_reminder',
        'Upcoming Consultation',
        message,
        consultationId,
        `/consultations/${consultationId}`
      );

      await this.sendNotification(
        teacherId,
        'consultation_reminder',
        'Upcoming Consultation',
        message,
        consultationId,
        `/consultations/${consultationId}`
      );
    } catch (error) {
      console.error('Error sending consultation reminder:', error);
    }
  }

  // Send message notification
  static async notifyNewMessage(messageId, receiverId, senderId, consultationId) {
    try {
      const sender = await User.findById(senderId);

      await this.sendNotification(
        receiverId,
        'new_message',
        `New Message from ${sender?.name || 'Unknown'}`,
        'You have a new message in consultation chat.',
        messageId,
        `/consultations/${consultationId}`
      );
    } catch (error) {
      console.error('Error notifying new message:', error);
    }
  }

  // Get user notifications
  static async getUserNotifications(userId, limit = 20, isRead = null) {
    try {
      const filter = { user: userId };
      if (isRead !== null) {
        filter.isRead = isRead;
      }

      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit);

      return notifications;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  // Get unread count
  static async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        user: userId,
        isRead: false
      });

      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Mark as read
  static async markAsRead(notificationId) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return null;
    }
  }

  // Mark all as read for user
  static async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { user: userId, isRead: false },
        { isRead: true }
      );

      return true;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return false;
    }
  }

  // Delete notification
  static async deleteNotification(notificationId) {
    try {
      await Notification.findByIdAndDelete(notificationId);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // Send system announcement
  static async sendSystemAnnouncement(title, message) {
    try {
      const users = await User.find({ isActive: true });
      const userIds = users.map(u => u._id);

      const notifications = userIds.map(userId => ({
        user: userId,
        type: 'system_announcement',
        title,
        message,
        isRead: false
      }));

      const result = await Notification.insertMany(notifications);
      return result;
    } catch (error) {
      console.error('Error sending system announcement:', error);
      return [];
    }
  }
}

module.exports = NotificationService;
