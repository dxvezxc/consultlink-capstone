// NotificationItem Component
// Individual notification item with backend integration
// Handles marking as read, deleting, and displaying notification details

import React, { useState } from 'react';
import { notificationAPI } from '../../api/notification';
import './NotificationItem.css';

const NotificationItem = ({ notification, onDeleted, onRead }) => {
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    const icons = {
      booking_request: '📅',
      booking_confirmed: '✅',
      booking_cancelled: '❌',
      reminder: '🔔',
      system: 'ℹ️'
    };
    return icons[type] || '📬';
  };

  // Get color based on notification type
  const getTypeColor = (type) => {
    const colors = {
      booking_request: '#FFA500',
      booking_confirmed: '#28a745',
      booking_cancelled: '#dc3545',
      reminder: '#0066cc',
      system: '#6c757d'
    };
    return colors[type] || '#999';
  };

  // Mark notification as read
  const handleMarkAsRead = async (e) => {
    e.stopPropagation();
    
    // If already read, don't do anything
    if (notification.isRead) return;

    try {
      setLoading(true);
      const response = await notificationAPI.markAsRead(notification._id);

      if (response.success) {
        onRead(notification._id, true);
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete notification
  const handleDelete = async (e) => {
    e.stopPropagation();

    try {
      setLoading(true);
      const response = await notificationAPI.deleteNotification(notification._id);

      if (response.success) {
        onDeleted(notification._id);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return new Date(date).toLocaleDateString();
  };

  // Format full date and time
  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
      onClick={() => {
        if (!notification.isRead) {
          handleMarkAsRead({ stopPropagation: () => {} });
        }
        setShowDetails(!showDetails);
      }}
    >
      {/* Indicator */}
      {!notification.isRead && <div className="notification-indicator"></div>}

      {/* Main Content */}
      <div className="notification-item-content">
        {/* Icon and Header */}
        <div className="notification-item-header">
          <span
            className="notification-icon"
            style={{ color: getTypeColor(notification.type) }}
          >
            {getNotificationIcon(notification.type)}
          </span>
          <div className="notification-item-header-content">
            <h4 className="notification-title">{notification.title}</h4>
            <span className="notification-type" style={{ color: getTypeColor(notification.type) }}>
              {notification.type.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <span className="notification-time">
            {formatTimeAgo(notification.createdAt)}
          </span>
        </div>

        {/* Message */}
        <p className="notification-message">{notification.message}</p>

        {/* Details Section */}
        {showDetails && (
          <div className="notification-details">
            <div className="notification-meta">
              <small>
                <strong>Received:</strong> {formatDateTime(notification.createdAt)}
              </small>
            </div>

            {notification.relatedTo && (
              <div className="notification-related">
                <small>
                  <strong>Related to:</strong> {notification.relatedModel}
                </small>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="notification-actions">
          {!notification.isRead && (
            <button
              className="action-btn mark-read"
              onClick={handleMarkAsRead}
              disabled={loading}
              title="Mark as read"
            >
              {loading ? '...' : 'Mark as read'}
            </button>
          )}
          <button
            className="action-btn delete"
            onClick={handleDelete}
            disabled={loading}
            title="Delete notification"
          >
            {loading ? '...' : '🗑️'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
