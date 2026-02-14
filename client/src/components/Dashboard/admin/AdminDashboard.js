import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axios';
import { LogOut, Users, BookOpen, BarChart3 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ChangePasswordModal from '../../Admin/ChangePasswordModal';
import ConfirmDeleteModal from '../../Admin/ConfirmDeleteModal';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', subjects: [] });
  const [newSubject, setNewSubject] = useState({ name: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard');
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [deletingTeacher, setDeletingTeacher] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/');
    }
  };

  // Fetch teachers and subjects on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const teacherRes = await axiosInstance.get('/admin/teachers');
        const subjectRes = await axiosInstance.get('/admin/subjects');
        const studentsRes = await axiosInstance.get('/admin/users?role=student');
        
        let consultations = [];
        try {
          // Fetch all consultations (admin has access to all)
          const consultationRes = await axiosInstance.get('/consultations');
          console.log('[AdminDashboard] consultationRes structure:', consultationRes);
          
          // Extract consultations from the response - handle different response structures
          if (Array.isArray(consultationRes)) {
            consultations = consultationRes;
          } else if (consultationRes.consultations && Array.isArray(consultationRes.consultations)) {
            consultations = consultationRes.consultations;
          } else if (Array.isArray(consultationRes.data)) {
            consultations = consultationRes.data;
          } else if (consultationRes.data?.consultations && Array.isArray(consultationRes.data.consultations)) {
            consultations = consultationRes.data.consultations;
          } else if (consultationRes.data?.data && Array.isArray(consultationRes.data.data)) {
            consultations = consultationRes.data.data;
          }
        } catch (consultErr) {
          console.log('Could not fetch consultations:', consultErr.message);
          consultations = [];
        }
        
        // axios interceptor unwraps response.data, so we get the raw data directly
        // Teachers, Subjects, and Students endpoints return arrays
        const teacherArray = Array.isArray(teacherRes) ? teacherRes : (Array.isArray(teacherRes.data) ? teacherRes.data : []);
        const subjectArray = Array.isArray(subjectRes) ? subjectRes : (Array.isArray(subjectRes.data) ? subjectRes.data : []);
        const studentArray = Array.isArray(studentsRes) ? studentsRes : (Array.isArray(studentsRes.data) ? studentsRes.data : []);
        
        console.log('[AdminDashboard] teachers:', teacherArray);
        console.log('[AdminDashboard] subjects:', subjectArray);
        console.log('[AdminDashboard] consultations:', consultations);
        
        setTeachers(teacherArray || []);
        setSubjects(subjectArray || []);
        setStudents(studentArray || []);
        setConsultations(Array.isArray(consultations) ? consultations : []);
        setError('');
      } catch (err) {
        console.error('[AdminDashboard] Fetch error:', err);
        setError(err.message || 'Failed to fetch data. Are you authorized?');
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
      const res = await axiosInstance.post('/admin/teachers', newTeacher);
      
      // axios interceptor unwraps response.data
      // response is: { msg, teacher, generatedPassword }
      const newTeacherData = res.teacher || res.data?.teacher || res;
      
      console.log('[addTeacher] response:', res);
      console.log('[addTeacher] newTeacherData:', newTeacherData);
      
      setTeachers([...teachers, newTeacherData]);
      setGeneratedPassword(res.generatedPassword || res.data?.generatedPassword || '');
      setNewTeacher({ name: '', email: '', subjects: [] });
      setSuccess('Teacher added successfully!');
      setError('');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('[addTeacher] error:', err);
      setError(err.message || err.response?.data?.msg || 'Failed to add teacher');
      setSuccess('');
    }
  };

  // Reset teacher password
  const handleResetPasswordClick = (teacher) => {
    setEditingTeacher(teacher);
  };

  // Delete teacher
  const handleDeleteTeacherClick = (teacher) => {
    setDeletingTeacher(teacher);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTeacher) return;
    
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axiosInstance.delete(`/admin/teachers/${deletingTeacher._id}`);
      setTeachers(teachers.filter(t => t._id !== deletingTeacher._id));
      setDeletingTeacher(null);
      setSuccess('Teacher deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete teacher');
    } finally {
      setDeleting(false);
    }
  };

  // Update teacher subjects
  const updateTeacherSubjects = async (teacherId, selectedSubjects) => {
    try {
      const res = await axiosInstance.put(`/admin/teachers/${teacherId}`, { subjects: selectedSubjects });
      
      // axios interceptor unwraps response.data
      const updatedTeacher = res.teacher || res.data?.teacher || res;
      
      setTeachers(teachers.map(t => t._id === teacherId ? updatedTeacher : t));
      setSuccess('Teacher subjects updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('[updateTeacherSubjects] error:', err);
      setError(err.message || err.response?.data?.msg || 'Failed to update subjects');
    }
  };

  // Add subject
  const addSubject = async () => {
    if (!newSubject.name) {
      setError('Subject name required');
      return;
    }
    
    try {
      const res = await axiosInstance.post('/admin/subjects', newSubject);
      
      // axios interceptor unwraps response.data, so res is the subject object directly
      const newSubjectData = res.subject || res.data?.subject || res;
      
      console.log('[addSubject] response:', res);
      
      setSubjects([...subjects, newSubjectData]);
      setNewSubject({ name: '' });
      setSuccess('Subject added successfully!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('[addSubject] error:', err);
      setError(err.message || err.response?.data?.msg || 'Failed to add subject');
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
      
      await axiosInstance.delete(`/admin/subjects/${id}`);
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
        <div className="sidebar-content">
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
        </div>

        {/* Logout Button */}
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      <div className="admin-main">
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

            {/* Monitoring Section */}
            <div className="monitoring-section">
              <h2>System Activity Monitoring</h2>
              
              <div className="monitoring-grid">
                {/* Teachers Overview */}
                <div className="monitoring-card teachers-card">
                  <div className="card-header">
                    <h3>👨‍🏫 Teachers Overview</h3>
                    <span className="count-badge">{teachers.length}</span>
                  </div>
                  
                  <div className="stat-summary">
                    <div className="stat-row">
                      <span>Total Teachers</span>
                      <strong>{teachers.length}</strong>
                    </div>
                  </div>

                  {teachers.length > 0 ? (
                    <div className="recent-list">
                      <h4>Recent Teachers</h4>
                      <div className="user-list">
                        {teachers.slice(0, 5).map(teacher => (
                          <div key={teacher._id} className="user-item">
                            <div className="user-avatar">
                              {teacher.name?.charAt(0) || 'T'}
                            </div>
                            <div className="user-info">
                              <p className="user-name">{teacher.name}</p>
                              <p className="user-email">{teacher.email}</p>
                            </div>
                            <span className="status-badge active">
                              ✓ Active
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="empty-message">No teachers yet</p>
                  )}
                </div>

                {/* Students Overview */}
                <div className="monitoring-card students-overview-card">
                  <div className="card-header">
                    <h3>👨‍🎓 Students Overview</h3>
                    <span className="count-badge">{students.length}</span>
                  </div>
                  
                  <div className="stat-summary">
                    <div className="stat-row">
                      <span>Total Students</span>
                      <strong>{students.length}</strong>
                    </div>
                  </div>

                  {students.length > 0 ? (
                    <div className="recent-list">
                      <h4>Recent Students</h4>
                      <div className="user-list">
                        {students.slice(0, 5).map(student => (
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

                {/* Subjects Overview */}
                <div className="monitoring-card subjects-card">
                  <div className="card-header">
                    <h3>📚 Subjects Overview</h3>
                    <span className="count-badge">{subjects.length}</span>
                  </div>
                  
                  <div className="stat-summary">
                    <div className="stat-row">
                      <span>Total Subjects</span>
                      <strong>{subjects.length}</strong>
                    </div>
                  </div>

                  {subjects.length > 0 ? (
                    <div className="recent-list">
                      <h4>All Subjects</h4>
                      <div className="subject-list">
                        {subjects.slice(0, 5).map(subject => (
                          <div key={subject._id} className="subject-item">
                            <div className="subject-icon">📖</div>
                            <div className="subject-info">
                              <p className="subject-name">{subject.name}</p>
                            </div>
                            <span className="status-badge active">
                              ✓ Active
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="empty-message">No subjects yet</p>
                  )}
                </div>

                {/* Consultation Overview */}
                <div className="monitoring-card consultation-card">
                  <div className="card-header">
                    <h3>💬 Consultation Overview</h3>
                    <span className="count-badge">{Array.isArray(consultations) ? consultations.length : 0}</span>
                  </div>
                  
                  <div className="stat-summary">
                    <div className="stat-row">
                      <span>Total Consultations</span>
                      <strong>{Array.isArray(consultations) ? consultations.length : 0}</strong>
                    </div>
                    <div className="stat-row">
                      <span>Pending</span>
                      <strong>{Array.isArray(consultations) ? consultations.filter(c => c.status === 'pending').length : 0}</strong>
                    </div>
                    <div className="stat-row">
                      <span>Confirmed</span>
                      <strong>{Array.isArray(consultations) ? consultations.filter(c => c.status === 'confirmed').length : 0}</strong>
                    </div>
                    <div className="stat-row">
                      <span>Completed</span>
                      <strong>{Array.isArray(consultations) ? consultations.filter(c => c.status === 'completed').length : 0}</strong>
                    </div>
                  </div>

                  {Array.isArray(consultations) && consultations.length > 0 ? (
                    <div className="recent-list">
                      <h4>Recent Consultations</h4>
                      <div className="consultation-list">
                        {consultations.slice(0, 5).map(consultation => (
                          <div key={consultation._id} className="consultation-item">
                            <div className="consultation-info">
                              <p className="consultation-student">
                                {consultation.student?.name || 'Student'}
                              </p>
                              <p className="consultation-teacher">
                                with {consultation.teacher?.name || 'Teacher'}
                              </p>
                            </div>
                            <span className={`status-badge ${consultation.status === 'pending' ? 'pending' : consultation.status === 'confirmed' ? 'confirmed' : 'completed'}`}>
                              {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="empty-message">No consultations yet</p>
                  )}
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
                          {(t.name || t.firstName || 'T').charAt(0).toUpperCase()}
                        </div>
                        <div className="teacher-info">
                          <h4>{t.name || t.firstName || 'Teacher'}</h4>
                          <p>{t.email || 'N/A'}</p>
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
                          onClick={() => handleResetPasswordClick(t)}
                        >
                          🔑 Reset Password
                        </button>
                        <button 
                          className="btn-danger" 
                          onClick={() => handleDeleteTeacherClick(t)}
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
      </div>

      {editingTeacher && (
        <ChangePasswordModal
          teacher={editingTeacher}
          onClose={() => setEditingTeacher(null)}
          onPasswordChanged={() => {
            setEditingTeacher(null);
          }}
        />
      )}

      {deletingTeacher && (
        <ConfirmDeleteModal
          teacher={deletingTeacher}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingTeacher(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
