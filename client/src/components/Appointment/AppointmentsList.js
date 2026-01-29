import React from 'react';
import { 
  Calendar, Clock, User, Video, MessageSquare, 
  MoreVertical, CheckCircle, XCircle, AlertCircle,
  MapPin, BookOpen
} from 'lucide-react';

const AppointmentsList = ({ appointments, onAppointmentAction, onViewDetails, userRole, viewMode }) => {
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', className: 'status-pending', icon: <AlertCircle size={14} /> },
      confirmed: { label: 'Confirmed', className: 'status-confirmed', icon: <CheckCircle size={14} /> },
      completed: { label: 'Completed', className: 'status-completed', icon: <CheckCircle size={14} /> },
      cancelled: { label: 'Cancelled', className: 'status-cancelled', icon: <XCircle size={14} /> },
      rejected: { label: 'Rejected', className: 'status-rejected', icon: <XCircle size={14} /> }
    };
    
    const config = statusConfig[status] || { label: status, className: 'status-default' };
    return (
      <span className={`status-badge ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  // Handle action button click
  const handleAction = (e, appointmentId, action, data = {}) => {
    e.stopPropagation();
    onAppointmentAction(action, appointmentId, data);
  };

  return (
    <div className={`appointments-list ${viewMode === 'grid' ? 'grid-view' : 'list-view'}`}>
      {viewMode === 'grid' ? (
        // Grid View
        <div className="appointments-grid">
          {appointments.map(appointment => (
            <div 
              key={appointment._id} 
              className="appointment-card"
              onClick={() => onViewDetails(appointment)}
            >
              {/* Card Header */}
              <div className="card-header">
                <div className="header-left">
                  <span className="appointment-subject">{appointment.subject}</span>
                  {getStatusBadge(appointment.status)}
                </div>
                <button className="more-btn">
                  <MoreVertical size={18} />
                </button>
              </div>

              {/* Card Body */}
              <div className="card-body">
                <div className="appointment-info">
                  <div className="info-row">
                    <Calendar size={14} />
                    <span>{formatDate(appointment.date)}</span>
                  </div>
                  <div className="info-row">
                    <Clock size={14} />
                    <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
                  </div>
                  <div className="info-row">
                    {userRole === 'student' ? (
                      <>
                        <User size={14} />
                        <span>With: {appointment.teacher?.name || 'Teacher'}</span>
                      </>
                    ) : (
                      <>
                        <User size={14} />
                        <span>Student: {appointment.student?.name || 'Student'}</span>
                      </>
                    )}
                  </div>
                  {appointment.location && (
                    <div className="info-row">
                      <MapPin size={14} />
                      <span>{appointment.location}</span>
                    </div>
                  )}
                </div>

                {appointment.reason && (
                  <div className="appointment-reason">
                    <p>{appointment.reason}</p>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="card-actions">
                {appointment.status === 'confirmed' && (
                  <button 
                    className="action-btn join-btn"
                    onClick={(e) => handleAction(e, appointment._id, 'join')}
                  >
                    <Video size={16} />
                    Join
                  </button>
                )}
                
                {userRole === 'teacher' && appointment.status === 'pending' && (
                  <>
                    <button 
                      className="action-btn approve-btn"
                      onClick={(e) => handleAction(e, appointment._id, 'approve')}
                    >
                      Approve
                    </button>
                    <button 
                      className="action-btn reject-btn"
                      onClick={(e) => handleAction(e, appointment._id, 'reject')}
                    >
                      Reject
                    </button>
                  </>
                )}
                
                {userRole === 'student' && (appointment.status === 'pending' || appointment.status === 'confirmed') && (
                  <button 
                    className="action-btn cancel-btn"
                    onClick={(e) => handleAction(e, appointment._id, 'cancel')}
                  >
                    Cancel
                  </button>
                )}
                
                <button 
                  className="action-btn details-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(appointment);
                  }}
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View (Table)
        <div className="appointments-table">
          <div className="table-header">
            <div className="table-cell">Subject</div>
            <div className="table-cell">{userRole === 'student' ? 'Teacher' : 'Student'}</div>
            <div className="table-cell">Date & Time</div>
            <div className="table-cell">Status</div>
            <div className="table-cell">Actions</div>
          </div>
          
          <div className="table-body">
            {appointments.map(appointment => (
              <div key={appointment._id} className="table-row">
                <div className="table-cell">
                  <div className="subject-cell">
                    <BookOpen size={16} />
                    <div>
                      <strong>{appointment.subject}</strong>
                      <small>{appointment.reason?.substring(0, 40)}...</small>
                    </div>
                  </div>
                </div>
                
                <div className="table-cell">
                  <div className="person-cell">
                    <User size={14} />
                    <span>
                      {userRole === 'student' 
                        ? appointment.teacher?.name || 'Teacher'
                        : appointment.student?.name || 'Student'
                      }
                    </span>
                  </div>
                </div>
                
                <div className="table-cell">
                  <div className="datetime-cell">
                    <Calendar size={14} />
                    <span>{formatDate(appointment.date)}</span>
                    <Clock size={14} />
                    <span>{formatTime(appointment.startTime)}</span>
                  </div>
                </div>
                
                <div className="table-cell">
                  {getStatusBadge(appointment.status)}
                </div>
                
                <div className="table-cell">
                  <div className="action-buttons">
                    {appointment.status === 'confirmed' && (
                      <button 
                        className="action-btn join-btn"
                        onClick={(e) => handleAction(e, appointment._id, 'join')}
                      >
                        <Video size={16} />
                      </button>
                    )}
                    
                    {userRole === 'teacher' && appointment.status === 'pending' && (
                      <>
                        <button 
                          className="action-btn approve-btn"
                          onClick={(e) => handleAction(e, appointment._id, 'approve')}
                          title="Approve"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          className="action-btn reject-btn"
                          onClick={(e) => handleAction(e, appointment._id, 'reject')}
                          title="Reject"
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                    
                    <button 
                      className="action-btn details-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(appointment);
                      }}
                      title="View Details"
                    >
                      <MessageSquare size={16} />
                    </button>
                    
                    {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                      <button 
                        className="action-btn cancel-btn"
                        onClick={(e) => handleAction(e, appointment._id, 'cancel')}
                        title="Cancel"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsList;