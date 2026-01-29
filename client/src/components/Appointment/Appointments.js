import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentsAPI } from '../../api/appointments';
import { Calendar, Filter, Search, Download, Plus } from 'lucide-react';

// Appointment Components
import AppointmentsList from './AppointmentsList';
import AppointmentFilters from './AppointmentFilters';
import AppointmentCalendar from './AppointmentCalendar';
import AppointmentStats from './AppointmentStats';
import EmptyAppointments from './EmptyAppointments';

// CSS
import './Appointments.css';

const Appointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter and view states
  const [viewMode, setViewMode] = useState('list'); // 'list', 'calendar', 'grid'
  const [filters, setFilters] = useState({
    status: 'all', // 'all', 'pending', 'confirmed', 'completed', 'cancelled'
    dateRange: 'all', // 'all', 'today', 'thisWeek', 'thisMonth', 'upcoming'
    searchQuery: '',
    sortBy: 'date-desc' // 'date-desc', 'date-asc', 'status'
  });
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    upcoming: 0
  });
  
  // Selected appointment for details
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Load appointments
  useEffect(() => {
    loadAppointments();
  }, [filters]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Determine which API to call based on user role
      const data = user.role === 'teacher' 
        ? await appointmentsAPI.getTeacherAppointments()
        : await appointmentsAPI.getStudentAppointments();
      
      // Apply filters
      const filtered = applyFilters(data);
      
      setAppointments(filtered);
      calculateStats(data);
      
    } catch (err) {
      console.error('Failed to load appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to appointments
  const applyFilters = (data) => {
    let filtered = [...data];
    
    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(app => app.status === filters.status);
    }
    
    // Filter by date range
    const now = new Date();
    if (filters.dateRange === 'today') {
      const today = now.toISOString().split('T')[0];
      filtered = filtered.filter(app => app.date === today);
    } else if (filters.dateRange === 'thisWeek') {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      filtered = filtered.filter(app => {
        const appDate = new Date(app.date);
        return appDate >= startOfWeek && appDate <= endOfWeek;
      });
    } else if (filters.dateRange === 'upcoming') {
      filtered = filtered.filter(app => {
        const appDate = new Date(app.date);
        return appDate >= now && app.status === 'confirmed';
      });
    }
    
    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.subject?.toLowerCase().includes(query) ||
        (user.role === 'student' ? app.teacher?.name?.toLowerCase().includes(query) : app.student?.name?.toLowerCase().includes(query)) ||
        app.reason?.toLowerCase().includes(query)
      );
    }
    
    // Sort appointments
    filtered.sort((a, b) => {
      if (filters.sortBy === 'date-desc') {
        return new Date(b.date) - new Date(a.date);
      } else if (filters.sortBy === 'date-asc') {
        return new Date(a.date) - new Date(b.date);
      } else if (filters.sortBy === 'status') {
        const statusOrder = { pending: 1, confirmed: 2, completed: 3, cancelled: 4 };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return 0;
    });
    
    return filtered;
  };

  // Calculate statistics
  const calculateStats = (data) => {
    const now = new Date();
    const stats = {
      total: data.length,
      pending: data.filter(app => app.status === 'pending').length,
      confirmed: data.filter(app => app.status === 'confirmed').length,
      completed: data.filter(app => app.status === 'completed').length,
      cancelled: data.filter(app => app.status === 'cancelled').length,
      upcoming: data.filter(app => {
        const appDate = new Date(app.date);
        return appDate >= now && app.status === 'confirmed';
      }).length
    };
    
    setStats(stats);
  };

  // Handle appointment actions
  const handleAppointmentAction = async (action, appointmentId, data = {}) => {
    try {
      setLoading(true);
      
      switch (action) {
        case 'cancel':
          if (window.confirm('Are you sure you want to cancel this appointment?')) {
            await appointmentsAPI.cancelAppointment(appointmentId, data.reason);
            alert('Appointment cancelled successfully.');
          }
          break;
          
        case 'approve':
          await appointmentsAPI.updateAppointmentStatus(appointmentId, 'confirmed');
          alert('Appointment approved successfully.');
          break;
          
        case 'reject':
          await appointmentsAPI.updateAppointmentStatus(appointmentId, 'rejected', data.reason);
          alert('Appointment rejected.');
          break;
          
        case 'complete':
          await appointmentsAPI.updateAppointmentStatus(appointmentId, 'completed');
          alert('Appointment marked as completed.');
          break;
          
        case 'reschedule':
          await appointmentsAPI.requestReschedule(appointmentId, data.newDate, data.newTime);
          alert('Reschedule request sent.');
          break;
          
        default:
          break;
      }
      
      // Reload appointments
      await loadAppointments();
      
    } catch (err) {
      console.error('Appointment action failed:', err);
      alert(`Failed to ${action} appointment. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle view appointment details
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetails(true);
  };

  // Handle new booking
  const handleNewBooking = () => {
    navigate('/booking');
  };

  // Export appointments (CSV)
  const handleExport = () => {
    // TODO: Implement CSV export
    alert('Export feature coming soon!');
  };

  if (loading && appointments.length === 0) {
    return (
      <div className="appointments-loading">
        <div className="spinner"></div>
        <p>Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="appointments-container">
      {/* Header */}
      <div className="appointments-header">
        <div className="header-left">
          <h1>My Appointments</h1>
          <p className="header-subtitle">
            {user.role === 'student' ? 'Manage your consultation bookings' : 'Manage your consultation schedule'}
          </p>
        </div>
        
        <div className="header-actions">
          <button 
            className="action-btn new-booking-btn"
            onClick={handleNewBooking}
          >
            <Plus size={18} />
            {user.role === 'student' ? 'New Booking' : 'Set Availability'}
          </button>
          
          <button 
            className="action-btn export-btn"
            onClick={handleExport}
            disabled={appointments.length === 0}
          >
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <AppointmentStats 
        stats={stats}
        userRole={user.role}
        onFilterChange={(filter) => setFilters(prev => ({ ...prev, ...filter }))}
      />

      {/* Main Content */}
      <div className="appointments-main">
        {/* Filters and Controls */}
        <AppointmentFilters 
          filters={filters}
          onFilterChange={setFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          userRole={user.role}
        />

        {/* Error Display */}
        {error && (
          <div className="appointments-error">
            <span>⚠</span> {error}
            <button onClick={() => setError(null)} className="error-close">×</button>
          </div>
        )}

        {/* Content Area */}
        <div className="appointments-content">
          {appointments.length === 0 ? (
            <EmptyAppointments 
              filters={filters}
              userRole={user.role}
              onNewBooking={handleNewBooking}
              onClearFilters={() => setFilters({
                status: 'all',
                dateRange: 'all',
                searchQuery: '',
                sortBy: 'date-desc'
              })}
            />
          ) : viewMode === 'calendar' ? (
            <AppointmentCalendar 
              appointments={appointments}
              onSelectAppointment={handleViewDetails}
              userRole={user.role}
            />
          ) : (
            <AppointmentsList 
              appointments={appointments}
              onAppointmentAction={handleAppointmentAction}
              onViewDetails={handleViewDetails}
              userRole={user.role}
              viewMode={viewMode}
            />
          )}
        </div>
      </div>

      {/* Appointment Details Modal (to be implemented) */}
      {showDetails && selectedAppointment && (
        <div className="appointment-details-modal">
          {/* Modal will be implemented separately */}
        </div>
      )}
    </div>
  );
};

export default Appointments;