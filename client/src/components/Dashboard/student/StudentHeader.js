import React, { useState } from 'react';
import { Search, Bell, HelpCircle, Calendar } from 'lucide-react';

const StudentHeader = ({ user, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState([
    { id: 1, message: 'Your consultation with Dr. Smith is tomorrow at 2 PM', time: '10 min ago', read: false },
    { id: 2, message: 'New subject "Data Structures" added to your interests', time: '1 hour ago', read: true },
    { id: 3, message: 'Your appointment has been confirmed', time: '2 hours ago', read: true },
  ]);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <header className="student-header">
      {/* Search Bar */}
      <div className="header-search">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search teachers, appointments, or subjects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Header Actions */}
      <div className="header-actions">
        {/* Calendar Button */}
        <button className="action-btn calendar-btn">
          <Calendar size={20} />
          <span className="action-label">Calendar</span>
        </button>

        {/* Help Button */}
        <button className="action-btn help-btn">
          <HelpCircle size={20} />
          <span className="action-label">Help</span>
        </button>

        {/* Notifications */}
        <div className="notifications-dropdown">
          <button className="action-btn notification-btn">
            <Bell size={20} />
            {unreadNotifications > 0 && (
              <span className="notification-badge">{unreadNotifications}</span>
            )}
          </button>
          
          {/* Notifications Panel */}
          <div className="notifications-panel">
            <div className="notifications-header">
              <h4>Notifications</h4>
              <button className="mark-all-read">Mark all read</button>
            </div>
            <div className="notifications-list">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                >
                  <div className="notification-dot"></div>
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="user-profile-display">
          <span className="student-name">{user?.name || 'Student'}</span>
        </div>
      </div>
    </header>
  );
};

export default StudentHeader;