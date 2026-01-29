import React from 'react';
import { Calendar, Clock, User, Settings, LogOut, Bell, Users, BookOpen, BarChart } from 'lucide-react';

const TeacherSidebar = ({ view, setView, user, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart size={20} /> },
    { id: 'schedule', label: 'My Schedule', icon: <Calendar size={20} /> },
    { id: 'availability', label: 'Availability', icon: <Clock size={20} /> },
    { id: 'requests', label: 'Appointment Requests', icon: <Bell size={20} />, badge: 3 },
    { id: 'subjects', label: 'My Subjects', icon: <BookOpen size={20} /> },
    { id: 'students', label: 'My Students', icon: <Users size={20} /> },
    { id: 'profile', label: 'Profile', icon: <User size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="teacher-sidebar">
      {/* Teacher Profile Section */}
      <div className="teacher-profile-section">
        <div className="teacher-avatar">
          {user?.name?.charAt(0) || 'T'}
        </div>
        <div className="teacher-info">
          <h3 className="teacher-name">{user?.name || 'Teacher'}</h3>
          <p className="teacher-role">Teacher</p>
          <p className="teacher-department">Department of {user?.department || 'Computer Science'}</p>
          <div className="teacher-stats">
            <div className="stat">
              <span className="stat-number">24</span>
              <span className="stat-label">Students</span>
            </div>
            <div className="stat">
              <span className="stat-number">18</span>
              <span className="stat-label">Hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${view === item.id ? 'active' : ''}`}
            onClick={() => setView(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge && (
              <span className="nav-badge">{item.badge}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="quick-stat">
          <div className="quick-stat-icon pending">⏳</div>
          <div className="quick-stat-info">
            <span className="quick-stat-number">5</span>
            <span className="quick-stat-label">Pending</span>
          </div>
        </div>
        <div className="quick-stat">
          <div className="quick-stat-icon today">📅</div>
          <div className="quick-stat-info">
            <span className="quick-stat-number">3</span>
            <span className="quick-stat-label">Today</span>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button className="logout-btn" onClick={onLogout}>
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default TeacherSidebar;