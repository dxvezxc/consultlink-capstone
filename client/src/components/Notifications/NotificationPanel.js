// NotificationPanel Component
// Main notification panel for displaying user notifications
// Fetches from backend and handles notification management

import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../../api/notification';
import NotificationList from './NotificationList';
import './NotificationPanel.css';

const NotificationPanel = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let filters = {};
      if (filter === 'unread') {
        filters.isRead = false;
      } else if (filter === 'read') {
        filters.isRead = true;
      }

      const response = await notificationAPI.getNotifications(filters);
      
      if (response.success) {
        setNotifications(response.data || []);
        setUnreadCount(response.unreadCount || 0);
      } else {
        setError('Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications on component mount and when filter changes
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, filter]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isOpen, filter]);

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationAPI.markAllAsRead();
      
      if (response.success) {
        // Update local state
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      } else {
        setError('Failed to mark all as read');
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
      setError(err.message);
    }
  };

  // Delete all notifications
  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete all notifications? This cannot be undone.')) {
      try {
        const response = await notificationAPI.deleteAllNotifications();
        
        if (response.success) {
          setNotifications([]);
          setUnreadCount(0);
        } else {
          setError('Failed to delete all notifications');
        }
      } catch (err) {
        console.error('Error deleting all notifications:', err);
        setError(err.message);
      }
    }
  };

  // Handle notification deleted from child component
  const handleNotificationDeleted = (notificationId) => {
    setNotifications(prev => prev.filter(n => n._id !== notificationId));
    
    // Recalculate unread count
    const remaining = notifications.filter(n => n._id !== notificationId);
    const newUnreadCount = remaining.filter(n => !n.isRead).length;
    setUnreadCount(newUnreadCount);
  };

  // Handle notification read status changed
  const handleNotificationRead = (notificationId, isRead) => {
    setNotifications(prev =>
      prev.map(n =>
        n._id === notificationId ? { ...n, isRead } : n
      )
    );

    // Update unread count
    const newUnreadCount = notifications.filter(n => {
      if (n._id === notificationId) return isRead ? false : true;
      return !n.isRead;
    }).length;
    setUnreadCount(newUnreadCount);
  };

  if (!isOpen) return null;

  return (
    <div className="notification-panel-overlay" onClick={onClose}>
      <div className="notification-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="notification-panel-header">
          <div className="notification-panel-title">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </div>
          <button className="notification-panel-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="notification-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
          <button
            className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Read
          </button>
        </div>

        {/* Actions */}
        <div className="notification-actions">
          {unreadCount > 0 && (
            <button 
              className="action-btn mark-all-read" 
              onClick={handleMarkAllAsRead}
              title="Mark all as read"
            >
              Mark all as read
            </button>
          )}
          {notifications.length > 0 && (
            <button 
              className="action-btn delete-all" 
              onClick={handleDeleteAll}
              title="Delete all notifications"
            >
              Delete all
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="notification-error">
            <p>{error}</p>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Content */}
        <div className="notification-panel-content">
          {loading ? (
            <div className="notification-loading">
              <div className="spinner"></div>
              <p>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty">
              <p>📭 No {filter !== 'all' ? filter : ''} notifications</p>
              <small>You're all caught up!</small>
            </div>
          ) : (
            <NotificationList
              notifications={notifications}
              onNotificationDeleted={handleNotificationDeleted}
              onNotificationRead={handleNotificationRead}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
