import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { availabilityAPI } from '../../../api/availability';
import consultationsAPI from '../../../api/consultations';

// Import Teacher Components
import TeacherSidebar from '../teacher/TeacherSidebar';
import TeacherSummaryCards from '../teacher/TeacherSummaryCards';
import TeacherAppointments from '../teacher/TeacherAppointments';
import TeacherAvailability from '../teacher/TeacherAvailability';
import TeacherRequests from '../teacher/TeacherRequests';
import TeacherSchedule from '../teacher/TeacherSchedule';
import TeacherStudents from '../teacher/TeacherStudents';
import TeacherProfile from '../teacher/TeacherProfile';

// Import CSS
import '../../../styles/teacherDashboard.css';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State Management
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(user);
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

  // Refetch appointments when needed
  const handleRefetchAppointments = async () => {
    try {
      const response = await consultationsAPI.getUserConsultations({ status: 'pending' });
      const appointments = Array.isArray(response)
        ? response
        : (response?.consultations || response?.data || []);
      setAppointmentRequests(appointments);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingRequests: appointments.length,
        todayConsultations: appointments.filter(apt => {
          const today = new Date().toDateString();
          return new Date(apt.dateTime).toDateString() === today;
        }).length,
      }));
    } catch (err) {
      console.error('Error refetching appointments:', err);
    }
  };

  // Load initial data from API
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
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
        
        // Handle slots - axios interceptor unwraps response.data, so slotsRes might be array or object
        const slots = Array.isArray(slotsRes) 
          ? slotsRes 
          : (slotsRes?.data || []);
        
        // Handle appointments - axios interceptor unwraps response.data
        // appointmentsRes is already unwrapped, so it's either the array or { success, count, consultations }
        const appointments = Array.isArray(appointmentsRes)
          ? appointmentsRes
          : (appointmentsRes?.consultations || appointmentsRes?.data || []);
        
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
      navigate('/');
    }
  };

  // Handle profile update to refresh sidebar
  const handleProfileUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  // Handle card click to navigate
  const handleCardClick = (link, cardId) => {
    if (link) {
      setView(link);
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
        user={currentUser}
        onLogout={handleLogout}
      />

      <div className="teacher-main">
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
              <TeacherSummaryCards 
                stats={stats}
                onCardClick={handleCardClick}
              />
              
              <div className="dashboard-grid">
                <div className="grid-column">
                  <TeacherAppointments 
                    requests={appointmentRequests}
                    onAppointmentAction={handleAppointmentAction}
                    onViewAll={() => setView('requests')}
                    onRefetch={handleRefetchAppointments}
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

          {view === 'students' && (
            <TeacherStudents />
          )}

          {view === 'profile' && (
            <TeacherProfile 
              user={currentUser}
              onBack={() => setView('dashboard')}
              onProfileUpdate={handleProfileUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;