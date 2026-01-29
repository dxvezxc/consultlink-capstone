import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { availabilityAPI } from '../../../api/availability';
import consultationsAPI from '../../../api/consultations';

// Import Teacher Components
import TeacherSidebar from '../teacher/TeacherSidebar';
import TeacherHeader from '../teacher/TeacherHeader';
import TeacherSummaryCards from '../teacher/TeacherSummaryCards';
import TeacherAppointments from '../teacher/TeacherAppointments';
import TeacherAvailability from '../teacher/TeacherAvailability';
import TeacherRequests from '../teacher/TeacherRequests';
import TeacherSchedule from '../teacher/TeacherSchedule';
import TeacherSubjects from '../teacher/TeacherSubjects';
import TeacherStudents from '../teacher/TeacherStudents';

// Import CSS
import '../../../styles/teacherDashboard.css';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State Management
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    todayConsultations: 0,
    thisWeek: 0,
    totalStudents: 0,
    weeklyHours: 0,
    rating: 0
  });
  
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [appointmentRequests, setAppointmentRequests] = useState([]);

  // Load initial data from API
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        console.log('TeacherDashboard: Loading initial data...');
        
        // Load real data from API
        const [slotsRes, appointmentsRes] = await Promise.all([
          availabilityAPI.getMyAvailability().catch(err => {
            console.error('Availability error:', err);
            return { data: [] };
          }),
          consultationsAPI.getUserConsultations({ status: 'pending' }).catch(err => {
            console.error('Consultations error:', err);
            return { consultations: [] };
          })
        ]);
        
        console.log('TeacherDashboard: slotsRes:', slotsRes);
        console.log('TeacherDashboard: appointmentsRes:', appointmentsRes);
        
        // Handle slots - axios interceptor unwraps response.data, so slotsRes might be array or object
        const slots = Array.isArray(slotsRes) 
          ? slotsRes 
          : (slotsRes?.data || []);
        
        // Handle appointments - axios interceptor unwraps response.data
        // appointmentsRes is already unwrapped, so it's either the array or { success, count, consultations }
        const appointments = Array.isArray(appointmentsRes)
          ? appointmentsRes
          : (appointmentsRes?.consultations || []);
        
        console.log('TeacherDashboard: appointments parsed:', appointments);
        
        setAvailabilitySlots(slots);
        setAppointmentRequests(appointments);
        
        // Calculate stats from real data
        setStats({
          pendingRequests: appointments.length,
          todayConsultations: appointments.filter(apt => {
            const today = new Date().toDateString();
            return new Date(apt.dateTime).toDateString() === today;
          }).length,
          thisWeek: appointments.length,
          totalStudents: new Set(appointments.map(apt => apt.student?._id)).size,
          weeklyHours: slots.reduce((total, slot) => {
            const start = parseInt(slot.startTime.split(':')[0]);
            const end = parseInt(slot.endTime.split(':')[0]);
            return total + (end - start);
          }, 0),
          rating: 4.8
        });
        
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
        console.error('Dashboard initialization error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Handle appointment actions
  const handleAppointmentAction = (appointmentId, action) => {
    // TODO: Implement API call
    console.log(`${action} appointment:`, appointmentId);
    
    // Update local state
    setAppointmentRequests(prev => 
      prev.filter(app => app._id !== appointmentId)
    );
    
    // Update stats
    if (action === 'approve') {
      setStats(prev => ({ 
        ...prev, 
        pendingRequests: Math.max(0, prev.pendingRequests - 1),
        todayConsultations: prev.todayConsultations + 1 
      }));
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your teacher dashboard...</p>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard">
      {/* Sidebar Navigation */}
      <TeacherSidebar 
        view={view}
        setView={setView}
        user={user}
        onLogout={handleLogout}
      />

      <div className="teacher-main">
        {/* Header with Search & Notifications */}
        <TeacherHeader 
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

        {/* Main Content - Switch Views */}
        <div className="teacher-content">
          {view === 'dashboard' && (
            <>
              {/* Dashboard Overview */}
              <TeacherSummaryCards stats={stats} />
              
              <div className="dashboard-grid">
                <div className="grid-column">
                  <TeacherAppointments 
                    requests={appointmentRequests}
                    onAppointmentAction={handleAppointmentAction}
                    onViewAll={() => setView('requests')}
                  />
                </div>
                <div className="grid-sidebar">
                  <TeacherAvailability 
                    slots={availabilitySlots}
                    onManageAvailability={() => setView('availability')}
                  />
                </div>
              </div>
            </>
          )}

          {view === 'schedule' && (
            <TeacherSchedule />
          )}

          {view === 'availability' && (
            <TeacherAvailability 
              slots={availabilitySlots}
              onManageAvailability={() => setView('availability')}
              isFullView={true}
              onBack={() => setView('dashboard')}
            />
          )}

          {view === 'requests' && (
            <TeacherRequests />
          )}

          {view === 'subjects' && (
            <TeacherSubjects />
          )}

          {view === 'students' && (
            <TeacherStudents />
          )}

          {view === 'profile' && (
            <div className="profile-view">
              <div className="view-header">
                <h2>Teacher Profile</h2>
                <button 
                  className="back-btn"
                  onClick={() => setView('dashboard')}
                >
                  ← Back to Dashboard
                </button>
              </div>
              <div className="profile-content">
                <p>Profile management coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;