import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { appointmentsAPI } from '../../../api/appointments';
import { subjectsAPI } from '../../../api/subjects';
import { teachersAPI } from '../../../api/teachers';

// Components
import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';
import StudentSummaryCards from './StudentSummaryCards';
import StudentAppointments from './StudentAppointments';
import BookingForm from '../../Booking/BookingForm';

import '../../../styles/studentDashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [view, setView] = useState('dashboard');
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
      pending: 0,
      approved: 0,
      completed: 0,
      cancelled: 0
    });

    // Load data on component mount
    useEffect(() => {
      const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch subjects
      try {
        console.log('Fetching subjects...');
        const subjectsData = await subjectsAPI.getAll();
        console.log('✓ Subjects loaded:', subjectsData);
        
        // Log first subject structure to verify consultants
        if (subjectsData && subjectsData.length > 0) {
          console.log('First subject structure:', {
            name: subjectsData[0].name,
            _id: subjectsData[0]._id,
            consultants: subjectsData[0].consultants,
            consultantsLength: subjectsData[0].consultants?.length || 0
          });
        }
        
        setSubjects(subjectsData || []);
      } catch (err) {
        console.error('✗ Subjects error:', err);
        console.error('Error details:', {
          message: err.message,
          status: err.status,
          data: err.data
        });
        setSubjects([]);
      }

      // Fetch appointments
      try {
        console.log('Fetching appointments...');
        const appointmentsData = await appointmentsAPI.getStudentAppointments();
        console.log('✓ Appointments loaded:', appointmentsData);
        
        // Store appointments in state
        setAppointments(appointmentsData && Array.isArray(appointmentsData) ? appointmentsData : []);
        
        // Calculate stats
        const stats = {
          pending: 0,
          approved: 0,
          completed: 0,
          cancelled: 0
        };

        if (appointmentsData && Array.isArray(appointmentsData)) {
          appointmentsData.forEach(appointment => {
            switch (appointment.status) {
              case 'pending':
                stats.pending++;
                break;
              case 'confirmed':
                stats.approved++;
                break;
              case 'completed':
                stats.completed++;
                break;
              case 'cancelled':
                stats.cancelled++;
                break;
              default:
                break;
            }
          });
        }
        setStats(stats);
      } catch (err) {
        console.error('✗ Appointments error:', err.message);
        setAppointments([]);
        setStats({
          pending: 0,
          approved: 0,
          completed: 0,
          cancelled: 0
        });
      }

      // Fetch teachers
      try {
        console.log('Fetching teachers...');
        const teachersData = await teachersAPI.getAll();
        console.log('✓ Teachers loaded:', teachersData);
        setTeachers(teachersData || []);
      } catch (err) {
        console.error('✗ Teachers error:', err.message);
        setTeachers([]);
      }

    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Unable to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
    
    fetchDashboardData();
  }, []);

  // Start booking process
  const startBooking = (subject) => {
    setSelectedSubject(subject);
    setSelectedConsultant(null);
    setView('book');
  };

  // Select consultant (teacher) for booking
  const selectConsultant = (consultant) => {
    setSelectedConsultant(consultant);
  };

  // Cancel booking and return to dashboard
  const cancelBooking = () => {
    setSelectedSubject(null);
    setSelectedConsultant(null);
    setView('dashboard');
  };

  // Handle successful booking
  const handleBookingSuccess = async () => {
    console.log('Booking successful, refetching appointments...');
    
    // Refetch appointments
    try {
      const appointmentsData = await appointmentsAPI.getStudentAppointments();
      console.log('✓ Appointments refreshed:', appointmentsData);
      console.log('Appointments count:', appointmentsData?.length || 0);
      
      if (!appointmentsData) {
        console.warn('Appointments API returned undefined or null');
        setAppointments([]);
      } else if (Array.isArray(appointmentsData)) {
        console.log('Appointments is an array');
        setAppointments(appointmentsData);
      } else if (appointmentsData.consultations) {
        console.log('Using consultations field');
        setAppointments(appointmentsData.consultations || []);
      } else {
        console.log('Unexpected response structure:', appointmentsData);
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      }
      
      // Update stats
      const stats = {
        pending: 0,
        approved: 0,
        completed: 0,
        cancelled: 0
      };

      if (appointmentsData && Array.isArray(appointmentsData)) {
        appointmentsData.forEach(appointment => {
          switch (appointment.status) {
            case 'pending':
              stats.pending++;
              break;
            case 'confirmed':
              stats.approved++;
              break;
            case 'completed':
              stats.completed++;
              break;
            case 'cancelled':
              stats.cancelled++;
              break;
            default:
              break;
          }
        });
      }
      setStats(stats);
    } catch (err) {
      console.error('✗ Failed to refresh appointments:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        data: err.data
      });
      setAppointments([]);
    }
    
    setSelectedSubject(null);
    setSelectedConsultant(null);
    setView('appointments');  // Go directly to appointments view to show the new booking
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Render loading state
  if (loading && view === 'dashboard') {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      {/* Sidebar */}
      <StudentSidebar 
        view={view} 
        setView={setView} 
        subjects={subjects} 
        startBooking={startBooking}
        onLogout={handleLogout}
        user={user}
      />

      <div className="student-main">
        {/* Header */}
        <StudentHeader 
          user={user}
          onLogout={handleLogout}
        />

        {/* Error Display */}
        {error && (
          <div className="dashboard-error">
            <span>⚠</span> {error}
            <button onClick={() => setError(null)} className="error-close">×</button>
          </div>
        )}

        {/* Main Content Views */}
        {view === 'dashboard' && (
          <>
            <StudentSummaryCards stats={stats} />
            <StudentAppointments 
              onBook={startBooking} 
              user={user}
            />
          </>
        )}

        {/* Subject Selection View */}
        {view === 'book' && selectedSubject && !selectedConsultant && (
          <div className="subject-consultant-selection">
            <div className="selection-header">
              <h2>Select a Consultant</h2>
              <p className="selection-subtitle">
                Choose a teacher for <strong>{selectedSubject.name}</strong>
              </p>
            </div>
            
            {selectedSubject.consultants?.length > 0 ? (
              <div className="consultant-grid">
                {selectedSubject.consultants.map((consultant) => (
                  <div
                    key={consultant._id}
                    className="consultant-card"
                    onClick={() => selectConsultant(consultant)}
                  >
                    <div className="consultant-avatar">
                      {consultant.name?.charAt(0) || 'T'}
                    </div>
                    <div className="consultant-info">
                      <h4 className="consultant-name">
                        {consultant.name || consultant.studentID}
                      </h4>
                      <p className="consultant-role">{consultant.role}</p>
                      <p className="consultant-subjects">
                        {consultant.subjects?.join(', ') || 'General'}
                      </p>
                      <div className="consultant-rating">
                        <span className="rating-stars">★★★★☆</span>
                        <span className="rating-text">4.2/5</span>
                      </div>
                    </div>
                    <div className="consultant-action">
                      <button className="select-btn">Select →</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-consultants">
                <div className="no-consultants-icon">👨‍🏫</div>
                <h3>No consultants available</h3>
                <p>There are no teachers available for {selectedSubject.name} at the moment.</p>
                <button className="cancel-btn" onClick={cancelBooking}>
                  Back to Subjects
                </button>
              </div>
            )}
            
            <div className="selection-footer">
              <button className="cancel-btn" onClick={cancelBooking}>
                ← Back to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Booking Form View */}
        {view === 'book' && selectedSubject && selectedConsultant && (
          <div className="booking-container">
            <BookingForm
              subject={selectedSubject}
              consultant={selectedConsultant}
              onBack={() => setSelectedConsultant(null)}
              onCancel={cancelBooking}
              onSuccess={handleBookingSuccess}
              user={user}
            />
          </div>
        )}

        {/* Appointments View */}
        {view === 'appointments' && (
          <div className="appointments-view">
            <div className="view-header">
              <h2>My Appointments</h2>
              <button 
                className="book-new-btn"
                onClick={() => setView('dashboard')}
              >
                ← Back to Dashboard
              </button>
            </div>
            <StudentAppointments 
              onBook={startBooking}
              appointments={appointments}
              user={user}
            />
          </div>
        )}

        {/* Browse Subjects View */}
        {view === 'subjects' && (
          <div className="browse-subjects-view">
            <div className="view-header">
              <h2>Browse All Subjects</h2>
              <button 
                className="back-btn"
                onClick={() => setView('dashboard')}
              >
                ← Back to Dashboard
              </button>
            </div>
            {subjects && subjects.length > 0 ? (
              <div className="subjects-grid">
                {subjects.map((subject) => (
                  <div key={subject._id} className="subject-card">
                    <div className="subject-header">
                      <div className="subject-icon">📚</div>
                      <h3 className="subject-name">{subject.name}</h3>
                    </div>
                    <div className="subject-body">
                      <p className="subject-description">{subject.description || 'No description available'}</p>
                      <div className="subject-consultants">
                        <p className="consultants-label">Available Teachers: <strong>{subject.consultants?.length || 0}</strong></p>
                        {subject.consultants && subject.consultants.length > 0 && (
                          <div className="consultant-list">
                            {subject.consultants.map((consultant) => (
                              <span key={consultant._id} className="consultant-badge">
                                {consultant.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="subject-footer">
                      <button 
                        className="book-btn"
                        onClick={() => startBooking(subject)}
                      >
                        Book Consultation →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3>No subjects available</h3>
                <p>Please check back later for available subjects.</p>
              </div>
            )}
          </div>
        )}

        {/* Find Teachers View */}
        {view === 'teachers' && (
          <div className="find-teachers-view">
            <div className="view-header">
              <h2>Find Teachers</h2>
              <button 
                className="back-btn"
                onClick={() => setView('dashboard')}
              >
                ← Back to Dashboard
              </button>
            </div>
            {teachers && teachers.length > 0 ? (
              <div className="teachers-grid">
                {teachers.map((teacher) => (
                  <div key={teacher._id} className="teacher-card">
                    <div className="teacher-header">
                      <div className="teacher-avatar">
                        {teacher.name?.charAt(0) || 'T'}
                      </div>
                      <div className="teacher-info">
                        <h3 className="teacher-name">{teacher.name}</h3>
                        <p className="teacher-email">{teacher.email}</p>
                      </div>
                    </div>
                    <div className="teacher-body">
                      <div className="teacher-subjects">
                        <p className="subjects-label">Teaches:</p>
                        <div className="subject-tags">
                          {teacher.subjects && teacher.subjects.length > 0 ? (
                            teacher.subjects.map((subject) => (
                              <span key={subject._id} className="tag">
                                {subject.name}
                              </span>
                            ))
                          ) : (
                            <span className="tag">No subjects assigned</span>
                          )}
                        </div>
                      </div>
                      <div className="teacher-rating">
                        <span className="rating-stars">★★★★☆</span>
                        <span className="rating-text">4.2/5</span>
                      </div>
                    </div>
                    <div className="teacher-footer">
                      <button 
                        className="contact-btn"
                        onClick={() => {
                          setSelectedConsultant(teacher);
                          if (teacher.subjects && teacher.subjects.length > 0) {
                            setSelectedSubject(teacher.subjects[0]);
                            setView('book');
                          }
                        }}
                      >
                        Book Consultation →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">👨‍🏫</div>
                <h3>No teachers available</h3>
                <p>Please check back later for available teachers.</p>
              </div>
            )}
          </div>
        )}

        {/* Profile View */}
        {view === 'profile' && (
          <div className="profile-view">
            <div className="view-header">
              <h2>My Profile</h2>
              <button 
                className="back-btn"
                onClick={() => setView('dashboard')}
              >
                ← Back to Dashboard
              </button>
            </div>
            <div className="profile-container">
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {user?.name?.charAt(0) || 'S'}
                  </div>
                  <div className="profile-info">
                    <h3 className="profile-name">{user?.name || 'Student'}</h3>
                    <p className="profile-email">{user?.email || 'No email'}</p>
                  </div>
                </div>
                
                <div className="profile-details">
                  <div className="detail-group">
                    <label>Student ID</label>
                    <p className="detail-value">{user?.studentID || 'N/A'}</p>
                  </div>
                  
                  <div className="detail-group">
                    <label>Role</label>
                    <p className="detail-value">Student</p>
                  </div>
                  
                  <div className="detail-group">
                    <label>Department</label>
                    <p className="detail-value">{user?.department || 'Not specified'}</p>
                  </div>
                  
                  <div className="detail-group">
                    <label>Account Status</label>
                    <p className="detail-value">
                      <span className="status-active">✓ Active</span>
                    </p>
                  </div>
                </div>

                <div className="profile-stats">
                  <div className="stat-box">
                    <div className="stat-value">8</div>
                    <div className="stat-label">Completed Sessions</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">2</div>
                    <div className="stat-label">Pending Sessions</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">4.5</div>
                    <div className="stat-label">Average Rating</div>
                  </div>
                </div>

                <div className="profile-actions">
                  <button className="edit-profile-btn">Edit Profile</button>
                  <button className="change-password-btn">Change Password</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;