import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, ChevronLeft, ChevronRight, Video, CheckCircle, AlertCircle } from 'lucide-react';
import consultationsAPI from '../../../api/consultations';
import { availabilityAPI } from '../../../api/availability';
import '../../../styles/teacherSchedule.css';

const TeacherSchedule = () => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [viewMode, setViewMode] = useState('week');
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + currentWeek * 7);
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return {
      date: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      fullDate: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
      dayOfWeek: date.getDay() // 0-6, Sunday-Saturday
    };
  });

  // Load appointments and availability
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load appointments for this teacher
        const appointmentsRes = await consultationsAPI.getUserConsultations({});
        const appointmentsData = Array.isArray(appointmentsRes)
          ? appointmentsRes
          : (appointmentsRes?.consultations || []);
        
        console.log('Loaded appointments:', appointmentsData);
        setAppointments(appointmentsData);
        
        // Load availability
        const availabilityRes = await availabilityAPI.getMyAvailability();
        const availabilityData = Array.isArray(availabilityRes)
          ? availabilityRes
          : (availabilityRes?.data || []);
        
        console.log('Loaded availability:', availabilityData);
        setAvailability(availabilityData);
        
      } catch (error) {
        console.error('Error loading schedule data:', error);
        setAppointments([]);
        setAvailability([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [currentWeek]);

  const getAppointmentsForDay = (day) => {
    return appointments
      .filter(app => {
        const appDate = new Date(app.dateTime).toISOString().split('T')[0];
        return appDate === day.date;
      })
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  };

  // Get availability slots for a specific day
  const getAvailabilityForDay = (day) => {
    return availability.filter(slot => slot.dayOfWeek === day.dayOfWeek);
  };

  // Format time from Date object
  const formatTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handlePreviousWeek = () => {
    setCurrentWeek(prev => prev - 1);
  };

  const handleNextWeek = () => {
    setCurrentWeek(prev => prev + 1);
  };

  const handleToday = () => {
    setCurrentWeek(0);
  };

  return (
    <div className="teacher-schedule-wrapper">
      {/* Schedule Header */}
      <div className="schedule-header">
        <div className="header-left">
          <h2>My Schedule</h2>
          <p className="header-subtitle">{startOfWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        
        <div className="header-right">
          <div className="view-mode">
            {['week', 'day', 'month'].map(mode => (
              <button
                key={mode}
                className={`view-btn ${viewMode === mode ? 'active' : ''}`}
                onClick={() => setViewMode(mode)}
              >
                {mode === 'week' ? '📅' : mode === 'day' ? '📆' : '📊'}
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="week-navigation">
            <button className="nav-btn" onClick={handlePreviousWeek} title="Previous week">
              <ChevronLeft size={20} />
            </button>
            <button className="today-btn" onClick={handleToday}>
              Today
            </button>
            <button className="nav-btn" onClick={handleNextWeek} title="Next week">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Week Overview Stats */}
      <div className="week-stats">
        <div className="stat-item">
          <div className="stat-icon confirmed">
            <CheckCircle size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">
              {appointments.filter(a => a.status === 'confirmed').length}
            </span>
            <span className="stat-text">This Week</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon pending">
            <AlertCircle size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">
              {appointments.filter(a => a.status === 'pending').length}
            </span>
            <span className="stat-text">Pending</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">
            <Clock size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">
              {availability.length > 0 
                ? `${availability.reduce((sum, slot) => {
                    const [startH] = slot.startTime.split(':').map(Number);
                    const [endH] = slot.endTime.split(':').map(Number);
                    return sum + (endH - startH);
                  }, 0)}h`
                : '0h'
              }
            </span>
            <span className="stat-text">Weekly Hours</span>
          </div>
        </div>
      </div>

      {/* Week Schedule Cards */}
      <div className="schedule-container">
        {weekDays.map(day => {
          const dayAppointments = getAppointmentsForDay(day);
          const isToday = day.date === today.toISOString().split('T')[0];
          
          return (
            <div key={day.date} className={`day-card ${isToday ? 'today' : ''}`}>
              {/* Day Header */}
              <div className="day-card-header">
                <div className="day-info">
                  <h3 className="day-name">{day.dayName}</h3>
                  <p className="day-date">{day.dayNumber} {day.month}</p>
                </div>
                {isToday && <span className="today-badge">Today</span>}
                <span className={`appointment-count ${dayAppointments.length > 0 ? 'active' : ''}`}>
                  {dayAppointments.length}
                </span>
              </div>

              {/* Day Appointments */}
              <div className="day-appointments">
                {dayAppointments.length > 0 ? (
                  dayAppointments.map(app => (
                    <div key={app._id} className={`appointment-item ${app.status}`}>
                      <div className="appointment-time-box">
                        <span className="time">{formatTime(app.dateTime)}</span>
                        <span className="duration">30m</span>
                      </div>
                      
                      <div className="appointment-details">
                        <h4 className="subject-name">
                          {app.subject?.name || 'Subject'}
                        </h4>
                        <div className="detail-row">
                          <User size={14} />
                          <span>{app.student?.name || 'Student'}</span>
                        </div>
                        <div className="detail-row">
                          <AlertCircle size={14} />
                          <span className={`status-badge ${app.status}`}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="appointment-actions">
                        {app.status === 'confirmed' && (
                          <button className="action-btn join-btn">
                            <Video size={14} />
                            Join
                          </button>
                        )}
                        {app.status === 'pending' && (
                          <button className="action-btn pending-btn">
                            <AlertCircle size={14} />
                            Review
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-appointments">
                    <div className="no-appointments-content">
                      <Calendar size={32} />
                      <p>No appointments</p>
                      {getAvailabilityForDay(day).length > 0 && (
                        <div className="availability-hint">
                          <p className="hint-text">Available:</p>
                          {getAvailabilityForDay(day).map((slot, idx) => (
                            <span key={idx} className="availability-slot">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeacherSchedule;