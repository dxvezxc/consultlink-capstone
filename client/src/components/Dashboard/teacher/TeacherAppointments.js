import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, MessageSquare, MoreVertical } from 'lucide-react';
import consultationsAPI from '../../../api/consultations';
import ChatBox from '../../Chat/ChatBox';
import '../../../styles/modal.css';

const TeacherAppointments = ({ requests, onAppointmentAction, onViewAll }) => {
  const [selectedFilter, setSelectedFilter] = useState('pending');
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

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

  const handleComplete = async (id) => {
    try {
      await consultationsAPI.completeConsultation(id);
      setAppointments(appointments.map(apt => 
        apt._id === id ? { ...apt, status: 'completed' } : apt
      ));
      alert('Appointment marked as completed!');
    } catch (error) {
      console.error('Error completing appointment:', error);
      alert('Error completing appointment: ' + error.message);
    }
  };

  const handleJoinMeeting = () => {
    alert('This Feature is not available');
  };

  const handleMessage = (appointment) => {
    setSelectedAppointment(appointment);
    setShowMessageModal(true);
  };

  const handleMoreOptions = (appointment) => {
    // Open view details modal/panel
    setSelectedAppointment(appointment);
    // You can navigate to a detail view or open a modal here
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
                <div className="appointment-header-right">
                  <span className={`status-badge status-${appointment.status}`}>
                    {appointment.status}
                  </span>
                  {appointment.status === 'confirmed' && (
                    <div className="header-action-buttons">
                      <button 
                        className="action-btn join-btn"
                        onClick={handleJoinMeeting}
                        title="Join meeting"
                      >
                        <Video size={16} />
                      </button>
                      <button 
                        className="action-btn message-btn"
                        onClick={() => handleMessage(appointment)}
                        title="Send message"
                      >
                        <MessageSquare size={16} />
                      </button>
                      <button 
                        className="action-btn complete-btn"
                        onClick={() => handleComplete(appointment._id)}
                        title="Mark as completed"
                      >
                        ✓
                      </button>
                      <button 
                        className="action-btn more-btn"
                        onClick={() => handleMoreOptions(appointment)}
                        title="More options"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  )}
                </div>
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat Box */}
      {showMessageModal && selectedAppointment && (
        <div className="chatbox-overlay">
          <ChatBox
            appointment={selectedAppointment}
            otherUser={selectedAppointment.student}
            onClose={() => {
              setShowMessageModal(false);
              setSelectedAppointment(null);
            }}
          />
        </div>
      )}

      {/* Detail Modal for More Options */}
      {selectedAppointment && !showMessageModal && (
        <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Appointment Details</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedAppointment(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body appointment-details">
              <div className="detail-row">
                <span className="label">Student:</span>
                <span className="value">{selectedAppointment.student?.name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Student ID:</span>
                <span className="value">{selectedAppointment.student?.studentID || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Subject:</span>
                <span className="value">{selectedAppointment.subject?.name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Date & Time:</span>
                <span className="value">{formatDate(selectedAppointment.dateTime)} at {formatTime(selectedAppointment.dateTime)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className={`status-badge status-${selectedAppointment.status}`}>
                  {selectedAppointment.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Notes:</span>
                <span className="value">{selectedAppointment.notes || 'No notes'}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setSelectedAppointment(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAppointments;