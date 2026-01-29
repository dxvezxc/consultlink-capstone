import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, ChevronLeft, ChevronRight, Video, CheckCircle, AlertCircle } from 'lucide-react';
import consultationsAPI from '../../../api/consultations';
import '../../../styles/teacherSchedule.css';

const TeacherSchedule = () => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [viewMode, setViewMode] = useState('week');
  const [appointments, setAppointments] = useState([]);
  
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
      fullDate: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    };
  });

  // Load real appointments
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const response = await consultationsAPI.getUserConsultations({ status: '' });
        const data = response.consultations || response.data || [];
        setAppointments(data);
      } catch (error) {
        console.error('Error loading appointments:', error);
        setAppointments([]);
      }
    };
    
    loadAppointments();
  }, []);

  const getAppointmentsForDay = (day) => {
    return appointments
      .filter(app => {
        const appDate = new Date(app.dateTime).toISOString().split('T')[0];
        return appDate === day.date;
      })
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
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
            <span className="stat-number">12</span>
            <span className="stat-text">This Week</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon pending">
            <AlertCircle size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">3</span>
            <span className="stat-text">Pending</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">
            <Clock size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">18h 30m</span>
            <span className="stat-text">Total Hours</span>
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
                    <div key={app.id} className={`appointment-item ${app.type}`}>
                      <div className="appointment-time-box">
                        <span className="time">{app.time}</span>
                        <span className="duration">{app.duration}m</span>
                      </div>
                      
                      <div className="appointment-details">
                        <h4 className="subject-name">{app.subject}</h4>
                        <div className="detail-row">
                          <User size={14} />
                          <span>{app.student}</span>
                        </div>
                        <div className="detail-row">
                          <MapPin size={14} />
                          <span>{app.location}</span>
                        </div>
                      </div>
                      
                      <div className="appointment-actions">
                        {app.type === 'confirmed' && (
                          <button className="action-btn join-btn">
                            <Video size={14} />
                            Join
                          </button>
                        )}
                        {app.type === 'pending' && (
                          <button className="action-btn pending-btn">
                            <AlertCircle size={14} />
                            Pending
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-appointments">
                    <Calendar size={32} />
                    <p>No appointments</p>
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