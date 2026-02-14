import React from 'react';
import { X, Calendar, Clock, User, BookOpen, MessageSquare } from 'lucide-react';

const AppointmentDetailModal = ({ appointment, onClose, onMessage, onCancel }) => {
  if (!appointment) return null;

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
    } catch (e) {
      return { date: dateString, time: '' };
    }
  };

  const dateTime = formatDateTime(appointment.dateTime || appointment.date);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'requested':
        return '#f59e0b';
      case 'confirmed':
      case 'approved':
        return '#10b981';
      case 'completed':
        return '#3b82f6';
      case 'canceled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getTeacherName = () => {
    if (appointment.teacher) {
      if (typeof appointment.teacher === 'object') {
        return appointment.teacher.name || appointment.teacher.studentID || 'Unknown Teacher';
      }
      return 'Teacher ID: ' + appointment.teacher;
    }
    return 'Unknown Teacher';
  };

  const getSubjectName = () => {
    if (appointment.subject) {
      if (typeof appointment.subject === 'object') {
        return appointment.subject.name || 'Unknown Subject';
      }
      return 'Subject ID: ' + appointment.subject;
    }
    return 'Unknown Subject';
  };

  const statusColor = getStatusColor(appointment.status);
  const canMessage = appointment.status?.toLowerCase() === 'confirmed' || appointment.status?.toLowerCase() === 'completed';
  const canCancel = appointment.status?.toLowerCase() !== 'canceled' && appointment.status?.toLowerCase() !== 'completed';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="appointment-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Consultation Details</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {/* Status Badge */}
          <div className="status-section">
            <span 
              className="status-badge large"
              style={{ 
                backgroundColor: statusColor,
                color: 'white'
              }}
            >
              {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)}
            </span>
          </div>

          {/* Main Details Grid */}
          <div className="details-grid">
            <div className="detail-item">
              <div className="detail-icon" style={{ color: '#3b82f6' }}>
                <BookOpen size={20} />
              </div>
              <div className="detail-info">
                <label>Subject</label>
                <p>{getSubjectName()}</p>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon" style={{ color: '#10b981' }}>
                <User size={20} />
              </div>
              <div className="detail-info">
                <label>Consultant</label>
                <p>{getTeacherName()}</p>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon" style={{ color: '#f59e0b' }}>
                <Calendar size={20} />
              </div>
              <div className="detail-info">
                <label>Date</label>
                <p>{dateTime.date}</p>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon" style={{ color: '#8b5cf6' }}>
                <Clock size={20} />
              </div>
              <div className="detail-info">
                <label>Time</label>
                <p>{dateTime.time}</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {appointment.notes && (
            <div className="additional-info">
              <h4>Notes</h4>
              <p>{appointment.notes}</p>
            </div>
          )}

          {appointment.meetingLink && (
            <div className="additional-info">
              <h4>Meeting Link</h4>
              <a href={appointment.meetingLink} target="_blank" rel="noopener noreferrer" className="meeting-link">
                {appointment.meetingLink}
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="modal-actions">
            {canMessage && (
              <button 
                className="action-btn message-btn"
                onClick={() => onMessage(appointment)}
              >
                <MessageSquare size={18} />
                Message Teacher
              </button>
            )}
            {canCancel && (
              <button 
                className="action-btn cancel-btn"
                onClick={() => onCancel(appointment._id)}
              >
                Cancel Consultation
              </button>
            )}
            <button 
              className="action-btn close-btn"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal;
