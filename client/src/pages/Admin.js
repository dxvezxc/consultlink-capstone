// Admin Page
// Admin dashboard for managing system

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import AdminSidebar from '../components/Admin/AdminSidebar';
import TeachersCardView from '../components/Admin/TeachersCardView';
import adminAPI from '../api/admin';
import '../styles/admin.css';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleNavigate = (section) => {
    setActiveSection(section);
  };

  if (loading) return <div>Loading...</div>;

  // If teachers section is active, show teachers card view
  if (activeSection === 'teachers') {
    return (
      <DashboardLayout>
        <div className="admin-page-layout">
          <AdminSidebar onNavigate={handleNavigate} activeSection={activeSection} />
          <div className="admin-content">
            <TeachersCardView />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Separate users into teachers and students
  const teachers = users.filter(u => u.role === 'teacher');
  const students = users.filter(u => u.role === 'student');

  // Get recent users (last 5)
  const recentTeachers = teachers.slice(0, 5);
  const recentStudents = students.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="admin-page">
        <h1>Admin Dashboard</h1>
        <p className="dashboard-subtitle">Manage your system</p>

        <div className="admin-tabs">
          <button 
            onClick={() => setActiveTab('overview')}
            className={activeTab === 'overview' ? 'active' : ''}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={activeTab === 'users' ? 'active' : ''}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab('consultations')}
            className={activeTab === 'consultations' ? 'active' : ''}
          >
            Consultations
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={activeTab === 'reports' ? 'active' : ''}
          >
            Reports
          </button>
        </div>

        {activeTab === 'overview' && stats && (
          <div className="overview-section">
            {/* Stats Cards */}
            <div className="admin-stats">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <h3>Total Teachers</h3>
                <p className="stat-value">{stats.users?.teachers || 0}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📚</div>
                <h3>Total Students</h3>
                <p className="stat-value">{stats.users?.students || 0}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <h3>Total Consultations</h3>
                <p className="stat-value">{stats.appointments?.total || 0}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <h3>Pending</h3>
                <p className="stat-value">{stats.appointments?.pending || 0}</p>
              </div>
            </div>

            {/* Monitoring Section */}
            <div className="monitoring-section">
              <h2>System Activity Monitoring</h2>
              
              <div className="monitoring-grid">
                {/* Teachers Monitoring */}
                <div className="monitoring-card teachers-card">
                  <div className="card-header">
                    <h3>👨‍🏫 Teachers Overview</h3>
                    <span className="count-badge">{stats.users?.teachers || 0}</span>
                  </div>
                  
                  <div className="stat-summary">
                    <div className="stat-row">
                      <span>Total Teachers</span>
                      <strong>{stats.users?.teachers || 0}</strong>
                    </div>
                    <div className="stat-row">
                      <span>Confirmed Consultations</span>
                      <strong>{stats.appointments?.confirmed || 0}</strong>
                    </div>
                    <div className="stat-row">
                      <span>Completed Sessions</span>
                      <strong>{stats.appointments?.completed || 0}</strong>
                    </div>
                  </div>

                  {recentTeachers.length > 0 ? (
                    <div className="recent-list">
                      <h4>Recent Teachers</h4>
                      <div className="user-list">
                        {recentTeachers.map(teacher => (
                          <div key={teacher._id} className="user-item">
                            <div className="user-avatar">
                              {teacher.name?.charAt(0) || 'T'}
                            </div>
                            <div className="user-info">
                              <p className="user-name">{teacher.name}</p>
                              <p className="user-email">{teacher.email}</p>
                            </div>
                            <span className={`status-badge ${teacher.isActive ? 'active' : 'inactive'}`}>
                              {teacher.isActive ? '✓ Active' : '✗ Inactive'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="empty-message">No teachers yet</p>
                  )}
                </div>

                {/* Students Monitoring */}
                <div className="monitoring-card students-card">
                  <div className="card-header">
                    <h3>👨‍🎓 Students Overview</h3>
                    <span className="count-badge">{stats.users?.students || 0}</span>
                  </div>
                  
                  <div className="stat-summary">
                    <div className="stat-row">
                      <span>Total Students</span>
                      <strong>{stats.users?.students || 0}</strong>
                    </div>
                    <div className="stat-row">
                      <span>Pending Consultations</span>
                      <strong>{stats.appointments?.pending || 0}</strong>
                    </div>
                    <div className="stat-row">
                      <span>Attended Sessions</span>
                      <strong>{stats.appointments?.completed || 0}</strong>
                    </div>
                  </div>

                  {recentStudents.length > 0 ? (
                    <div className="recent-list">
                      <h4>Recent Students</h4>
                      <div className="user-list">
                        {recentStudents.map(student => (
                          <div key={student._id} className="user-item">
                            <div className="user-avatar">
                              {student.name?.charAt(0) || 'S'}
                            </div>
                            <div className="user-info">
                              <p className="user-name">{student.name}</p>
                              <p className="user-email">{student.email}</p>
                            </div>
                            <span className={`status-badge ${student.isActive ? 'active' : 'inactive'}`}>
                              {student.isActive ? '✓ Active' : '✗ Inactive'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="empty-message">No students yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}