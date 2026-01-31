// NotificationList Component
// Displays list of notifications from backend
// Handles notification rendering and callbacks

import React from 'react';
import NotificationItem from './NotificationItem';
import './NotificationList.css';

const NotificationList = ({
  notifications = [],
  onNotificationDeleted,
  onNotificationRead
}) => {
  // Group notifications by date
  const groupNotificationsByDate = (notifs) => {
    const groups = {};

    notifs.forEach(notification => {
      const date = new Date(notification.createdAt);
      const dateKey = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(notification);
    });

    return groups;
  };

  // Format date groups
  const isToday = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isYesterday = (dateString) => {
    const date = new Date(dateString);
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    return date.toDateString() === yesterday.toDateString();
  };

  const formatDateLabel = (dateString) => {
    if (isToday(dateString)) return 'Today';
    if (isYesterday(dateString)) return 'Yesterday';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: new Date(dateString).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const groupedNotifications = groupNotificationsByDate(notifications);
  const sortedDates = Object.keys(groupedNotifications).sort((a, b) => {
    return new Date(b) - new Date(a);
  });

  return (
    <div className="notification-list">
      {sortedDates.map(dateKey => (
        <div key={dateKey} className="notification-date-group">
          <div className="notification-date-label">
            <span>{formatDateLabel(groupedNotifications[dateKey][0].createdAt)}</span>
          </div>
          <div className="notification-date-items">
            {groupedNotifications[dateKey].map(notification => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onDeleted={onNotificationDeleted}
                onRead={onNotificationRead}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationList;
