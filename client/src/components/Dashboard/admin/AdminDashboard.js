import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Bell, HelpCircle, Calendar, LogOut, Users, BookOpen, BarChart3, Settings } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', subjects: [] });
  const [newSubject, setNewSubject] = useState({ name: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState([
    { id: 1, message: 'New teacher registered', time: '10 min ago', read: false },
    { id: 2, message: 'System update completed', time: '1 hour ago', read: true },
  ]);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Fetch teachers and subjects on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('No authentication token found. Please login again.');
          setLoading(false);
          return;
        }
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        const teacherRes = await axios.get('/api/admin/teachers', config);
        const subjectRes = await axios.get('/api/admin/subjects', config);
        setTeachers(teacherRes.data);
        setSubjects(subjectRes.data);
        setError('');
      } catch (err) {
        console.error('Fetch error details:', err.response?.data || err.message);
        setError(err.response?.data?.msg || 'Failed to fetch data. Are you authorized?');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Add teacher
  const addTeacher = async () => {
    if (!newTeacher.name || !newTeacher.email) {
      setError('Name and email are required');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const res = await axios.post('/api/admin/teachers', newTeacher, config);
      setTeachers([...teachers, res.data.teacher]);
      setGeneratedPassword(res.data.generatedPassword);
      setNewTeacher({ name: '', email: '', subjects: [] });
      setSuccess('Teacher added successfully!');
      setError('');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to add teacher');
      setSuccess('');
    }
  };

  // Reset teacher password
  const resetPassword = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const res = await axios.put(`/api/admin/teachers/${id}/reset-password`, {}, config);
      setSuccess(`Password reset! New password: ${res.data.newPassword}`);
      setTimeout(() => setSuccess(''), 10000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to reset password');
    }
  };

  // Delete teacher
  const deleteTeacher = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.delete(`/api/admin/teachers/${id}`, config);
      setTeachers(teachers.filter(t => t._id !== id));
      setSuccess('Teacher deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete teacher');
    }
  };

  // Update teacher subjects
  const updateTeacherSubjects = async (teacherId, selectedSubjects) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const res = await axios.put(`/api/admin/teachers/${teacherId}`, { subjects: selectedSubjects }, config);
      setTeachers(teachers.map(t => t._id === teacherId ? res.data : t));
      setSuccess('Teacher subjects updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update subjects');
    }
  };

  // Add subject
  const addSubject = async () => {
    if (!newSubject.name) {
      setError('Subject name required');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const res = await axios.post('/api/admin/subjects', newSubject, config);
      setSubjects([...subjects, res.data]);
      setNewSubject({ name: '' });
      setSuccess('Subject added successfully!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to add subject');
      setSuccess('');
    }
  };

  // Delete subject
  const deleteSubject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.delete(`/api/admin/subjects/${id}`, config);
      setSubjects(subjects.filter(s => s._id !== id));
      setSuccess('Subject deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete subject');
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="admin-sidebar">
        {/* Admin Profile Section */}
        <div className="admin-profile-section">
          <div className="admin-avatar">A</div>
          <div className="admin-info">
            <h3 className="admin-name">Administrator</h3>
            <p className="admin-role">Admin</p>
            <p className="admin-id">System Admin</p>
            <div className="admin-stats">
              <div className="stat">
                <span className="stat-number">{teachers.length}</span>
                <span className="stat-label">Teachers</span>
              </div>
              <div className="stat">
                <span className="stat-number">{subjects.length}</span>
                <span className="stat-label">Subjects</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${view === 'dashboard' ? 'active' : ''}`}
            onClick={() => setView('dashboard')}
          >
            <span className="nav-icon"><BarChart3 size={20} /></span>
            <span className="nav-label">Dashboard</span>
          </button>
          <button
            className={`nav-item ${view === 'teachers' ? 'active' : ''}`}
            onClick={() => setView('teachers')}
          >
            <span className="nav-icon"><Users size={20} /></span>
            <span className="nav-label">Teachers</span>
          </button>
          <button
            className={`nav-item ${view === 'subjects' ? 'active' : ''}`}
            onClick={() => setView('subjects')}
          >
            <span className="nav-icon"><BookOpen size={20} /></span>
            <span className="nav-label">Subjects</span>
          </button>
          <button
            className={`nav-item ${view === 'settings' ? 'active' : ''}`}
            onClick={() => setView('settings')}
          >
            <span className="nav-icon"><Settings size={20} /></span>
            <span className="nav-label">Settings</span>
          </button>
        </nav>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="quick-stat">
            <div className="quick-stat-icon today">👥</div>
            <div className="quick-stat-info">
              <span className="quick-stat-number">{teachers.length}</span>
              <span className="quick-stat-label">Teachers</span>
            </div>
          </div>
          <div className="quick-stat">
            <div className="quick-stat-icon upcoming">📚</div>
            <div className="quick-stat-info">
              <span className="quick-stat-number">{subjects.length}</span>
              <span className="quick-stat-label">Subjects</span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button className="logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          {/* Search Bar */}
          <div className="header-search">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search teachers, subjects..."
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
            <div className="user-profile-dropdown">
              <button className="user-profile-btn">
                <div className="user-avatar-small">A</div>
                <div className="user-info">
                  <span className="user-name">Admin</span>
                  <span className="user-role">Administrator</span>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Error Display */}
        {error && (
          <div className="dashboard-error">
            <span>⚠</span> {error}
            <button onClick={() => setError(null)} className="error-close">×</button>
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div className="dashboard-success">
            <span>✓</span> {success}
            <button onClick={() => setSuccess(null)} className="success-close">×</button>
          </div>
        )}

        {/* Dashboard Content */}
        {view === 'dashboard' && (
          <div className="dashboard-content">
            <h1>Admin Dashboard</h1>
            <p className="subtitle">Manage your system</p>
            
            {/* Summary Cards */}
            <div className="admin-summary-cards">
              <div className="summary-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                <div className="card-content">
                  <div className="card-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
                    <Users size={24} />
                  </div>
                  <div className="card-stats">
                    <h3 className="card-value">{teachers.length}</h3>
                    <p className="card-title">Total Teachers</p>
                  </div>
                </div>
              </div>
              <div className="summary-card" style={{ borderLeft: '4px solid #10b981' }}>
                <div className="card-content">
                  <div className="card-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
                    <BookOpen size={24} />
                  </div>
                  <div className="card-stats">
                    <h3 className="card-value">{subjects.length}</h3>
                    <p className="card-title">Total Subjects</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Teachers Management */}
        {view === 'teachers' && (
          <div className="management-content">
            <h1>Teacher Management</h1>

            {/* Add Teacher Form */}
            <div className="admin-card">
              <h3 className="card-title">Add New Teacher</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter teacher name"
                    value={newTeacher.name}
                    onChange={e => setNewTeacher({ ...newTeacher, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Enter email address"
                    value={newTeacher.email}
                    onChange={e => setNewTeacher({ ...newTeacher, email: e.target.value })}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Assign Subjects (Hold Ctrl/Cmd to select multiple)</label>
                  <select
                    className="form-select"
                    multiple
                    value={newTeacher.subjects}
                    onChange={e => {
                      const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                      setNewTeacher({ ...newTeacher, subjects: selected });
                    }}
                  >
                    {subjects.map(sub => (
                      <option key={sub._id} value={sub._id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button className="btn-primary" onClick={addTeacher}>
                ➕ Add Teacher
              </button>
              
              {generatedPassword && (
                <div className="password-display">
                  <strong>Generated Password:</strong> 
                  <code>{generatedPassword}</code>
                  <button 
                    className="btn-copy"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPassword);
                      setSuccess('Password copied to clipboard!');
                      setTimeout(() => setSuccess(''), 2000);
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
              )}
            </div>

            {/* Teachers List */}
            <div className="admin-card">
              <h3 className="card-title">Teachers List</h3>
              {teachers.length === 0 ? (
                <div className="empty-state">
                  <p>No teachers found. Add your first teacher above.</p>
                </div>
              ) : (
                <div className="teachers-grid">
                  {teachers.map(t => (
                    <div key={t._id} className="teacher-card">
                      <div className="teacher-header">
                        <div className="teacher-avatar">
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="teacher-info">
                          <h4>{t.name}</h4>
                          <p>{t.email}</p>
                        </div>
                      </div>
                      
                      <div className="teacher-subjects">
                        <label>Subjects:</label>
                        <select
                          className="form-select-small"
                          multiple
                          value={t.subjects?.map(s => s._id) || []}
                          onChange={e => {
                            const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                            updateTeacherSubjects(t._id, selected);
                          }}
                        >
                          {subjects.map(sub => (
                            <option key={sub._id} value={sub._id}>{sub.name}</option>
                          ))}
                        </select>
                        <div className="subject-tags">
                          {t.subjects?.map(s => (
                            <span key={s._id} className="subject-tag">{s.name}</span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="teacher-actions">
                        <button 
                          className="btn-warning" 
                          onClick={() => resetPassword(t._id)}
                        >
                          🔑 Reset Password
                        </button>
                        <button 
                          className="btn-danger" 
                          onClick={() => deleteTeacher(t._id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subjects Management */}
        {view === 'subjects' && (
          <div className="management-content">
            <h1>Subject Management</h1>

            {/* Add Subject Form */}
            <div className="admin-card">
              <h3 className="card-title">Add New Subject</h3>
              <div className="form-inline">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter subject name"
                  value={newSubject.name}
                  onChange={e => setNewSubject({ ...newSubject, name: e.target.value })}
                />
                <button className="btn-primary" onClick={addSubject}>
                  ➕ Add Subject
                </button>
              </div>
            </div>

            {/* Subjects List */}
            <div className="admin-card">
              <h3 className="card-title">Subjects List</h3>
              {subjects.length === 0 ? (
                <div className="empty-state">
                  <p>No subjects found. Add your first subject above.</p>
                </div>
              ) : (
                <div className="subjects-list">
                  {subjects.map(s => (
                    <div key={s._id} className="subject-item">
                      <div className="subject-icon">📚</div>
                      <div className="subject-name">{s.name}</div>
                      <button 
                        className="btn-danger" 
                        onClick={() => deleteSubject(s._id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings */}
        {view === 'settings' && (
          <div className="management-content">
            <h1>System Settings</h1>
            <div className="admin-card">
              <p>Settings coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
