import React from 'react';
import { 
  BarChart,
  User, 
  LogOut,
  BookOpen,
  Users
} from 'lucide-react';

const StudentSidebar = ({ view, setView, subjects, startBooking, onLogout, user, stats }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart size={20} /> },
    { id: 'subjects', label: 'Browse Subjects', icon: <BookOpen size={20} /> },
    { id: 'teachers', label: 'Find Teachers', icon: <Users size={20} /> },
    { id: 'profile', label: 'Profile', icon: <User size={20} /> },
  ];

  return (
    <div className="student-sidebar">
      <div className="sidebar-content">
        {/* Student Profile Section */}
        <div className="student-profile-section">
          <div className="student-avatar">
            {user?.name?.charAt(0) || 'S'}
          </div>
          <div className="student-info">
            <p className="student-id">ID: {user?.studentID || 'N/A'}</p>
            <h2 className="student-fullname">{user?.name || 'Student Name'}</h2>
            <p className="student-role">Student</p>
            <div className="student-stats">
              <div className="stat">
                <span className="stat-number">{stats?.completed || 0}</span>
                <span className="stat-label">Completed</span>
              </div>
              <div className="stat">
                <span className="stat-number">{stats?.pending || 0}</span>
                <span className="stat-label">Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${view === item.id ? 'active' : ''}`}
              onClick={() => setView(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
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

export default StudentSidebar;