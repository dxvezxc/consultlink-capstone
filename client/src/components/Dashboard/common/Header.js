// Header Component
// Top header for dashboard with user info and notifications

import React from 'react';
import { Bell, User } from 'lucide-react';
import { useNotifications } from '../../../hooks/useNotifications';
import '../../../styles/dashboard.css';

export default function Header({ user, onSidebarToggle }) {
  const { unreadCount } = useNotifications();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onSidebarToggle}>
          ☰
        </button>
      </div>

      <div className="header-title">
        <h1>Welcome, {user?.name}!</h1>
      </div>

      <div className="header-right">
        <div className="notification-bell">
          <Bell size={24} />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </div>

        <button 
          className="user-menu-toggle"
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          <User size={24} />
        </button>

        {showUserMenu && (
          <div className="user-menu">
            <a href="/profile">Profile</a>
            <a href="/settings">Settings</a>
            <a href="/help">Help</a>
            <hr />
            <button onClick={() => console.log('Logout')} style={{background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', width: '100%'}}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}
