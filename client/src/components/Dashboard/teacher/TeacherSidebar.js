import React from 'react';
import { Calendar, Clock, User, LogOut, Bell, BarChart } from 'lucide-react';

const TeacherSidebar = ({ view, setView, user, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart size={20} /> },
    { id: 'schedule', label: 'My Schedule', icon: <Calendar size={20} /> },
    { id: 'availability', label: 'Availability', icon: <Clock size={20} /> },
    { id: 'requests', label: 'Appointment Requests', icon: <Bell size={20} />, badge: 3 },
    { id: 'profile', label: 'Profile', icon: <User size={20} /> },
  ];

  return (
    <div className="teacher-sidebar">
      <div className="sidebar-content">
        {/* Teacher Name at Top */}
        <div className="teacher-name-header">
          <h2 className="sidebar-teacher-name">{user?.name || 'Teacher'}</h2>
        </div>

        {/* Teacher Profile Section */}
        <div className="teacher-profile-section">
          <div className="teacher-avatar">
            {user?.name?.charAt(0) || 'T'}
          </div>
          <div className="teacher-info">
            <p className="teacher-role">Teacher</p>
            <p className="teacher-department">Department of {user?.department || 'Computer Science'}</p>
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