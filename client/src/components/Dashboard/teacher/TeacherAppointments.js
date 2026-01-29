import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, MessageSquare, MoreVertical } from 'lucide-react';
import consultationsAPI from '../../../api/consultations';

const TeacherAppointments = ({ requests, onAppointmentAction, onViewAll }) => {
  const [selectedFilter, setSelectedFilter] = useState('pending');
  const [appointments, setAppointments] = useState([]);

  // Load pending appointments from database
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const response = await consultationsAPI.getUserConsultations({ status: 'pending' });
        setAppointments(response.consultations || response.data || []);
      } catch (error) {
        console.error('Error loading appointments:', error);
        setAppointments([]);
      }
    };
    loadAppointments();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleApprove = async (id) => {
    try {
      await consultationsAPI.approveConsultation(id);
      setAppointments(appointments.filter(apt => apt._id !== id));
      alert('Appointment confirmed!');
    } catch (error) {
      console.error('Error confirming appointment:', error);
      alert('Error confirming appointment: ' + error.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await consultationsAPI.rejectConsultation(id, 'Declined by teacher');
      setAppointments(appointments.filter(apt => apt._id !== id));
      alert('Appointment rejected!');
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      alert('Error rejecting appointment: ' + error.message);
    }
  };

  return (
    <div className="teacher-appointments">
      <div className="appointments-header">
        <h3>Appointment Requests</h3>
        <div className="header-controls">
          <div className="filter-tabs">
            {['pending', 'upcoming', 'all'].map(filter => (
              <button
                key={filter}
                className={`filter-tab ${selectedFilter === filter ? 'active' : ''}`}
                onClick={() => setSelectedFilter(filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
          <button className="view-all-btn" onClick={onViewAll}>
            View All →
          </button>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="empty-appointments">
          <Calendar size={48} className="empty-icon" />
          <h4>No Pending Requests</h4>
          <p>You don't have any appointment requests at the moment.</p>
        </div>
      ) : (
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="appointment-card">
              <div className="appointment-header">
                <div className="student-info">
                  <div className="student-avatar">
                    {appointment.student?.name?.charAt(0) || 'S'}
                  </div>
                  <div className="student-details">
                    <h4 className="student-name">{appointment.student?.name || 'Student'}</h4>
                    <p className="student-id">{appointment.student?.studentID || 'ID: N/A'}</p>
                  </div>
                </div>
                <span className={`status-badge status-${appointment.status}`}>
                  {appointment.status}
                </span>
              </div>

              <div className="appointment-body">
                <h4 className="appointment-subject">{appointment.subject?.name || 'N/A'}</h4>
                <p className="appointment-reason">{appointment.notes || 'No notes'}</p>
                
                <div className="appointment-time">
                  <Clock size={14} />
                  <span>{formatDate(appointment.dateTime)}</span>
                  <span className="time-slot">{formatTime(appointment.dateTime)}</span>
                </div>
              </div>

              <div className="appointment-actions">
                {appointment.status === 'pending' && (
                  <>
                    <button 
                      className="action-btn approve-btn"
                      onClick={() => handleApprove(appointment._id)}
                    >
                      Approve
                    </button>
                    <button 
                      className="action-btn reject-btn"
                      onClick={() => handleReject(appointment._id)}
                    >
                      Reject
                    </button>
                  </>
                )}
                {appointment.status === 'confirmed' && (
                  <>
                    <button className="action-btn join-btn">
                      <Video size={16} />
                      Join Meeting
                    </button>
                    <button className="action-btn message-btn">
                      <MessageSquare size={16} />
                      Message
                    </button>
                  </>
                )}
                <button className="action-btn more-btn">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherAppointments;