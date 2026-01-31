import React, { useState } from 'react';
import API from '../../../api/axios';
import { Trash2, AlertCircle, Eye } from 'lucide-react';

const StudentAppointments = ({ appointments = [], onBook, user, onAppointmentClick }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await API.put(
        `/appointments/${appointmentId}/cancel`,
        { reason: 'Student requested cancellation' }
      );

      console.log('Appointment cancelled:', response);
      alert('Appointment cancelled successfully!');
      
      // Optionally reload the page or refetch appointments
      window.location.reload();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError(err.error || err.msg || err.message || 'Failed to cancel appointment');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString('en-US'),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
    } catch (e) {
      return { date: dateString, time: '' };
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
      case 'requested':
        return 'status-pending';
      case 'confirmed':
      case 'approved':
        return 'status-confirmed';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-unknown';
    }
  };

  return (
    <div className="appointments-section">
      <div className="appointments-header">
        <h4>My Appointments</h4>
        <button className="book-btn" onClick={onBook}>
          + Book Consultation
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {console.log('StudentAppointments render - appointments:', appointments)}

      {!appointments || appointments.length === 0 ? (
        <div className="no-appointments">
          <p>No appointments yet. Book one now!</p>
          <button className="book-btn" onClick={onBook}>
            + Book Consultation
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Teacher</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => {
                const dateTime = formatDateTime(appointment.dateTime || appointment.date);
                
                // Handle both populated and unpopulated teacher objects
                let teacherName = 'Unknown Teacher';
                if (appointment.teacher) {
                  if (typeof appointment.teacher === 'object') {
                    teacherName = appointment.teacher.name || appointment.teacher.studentID || 'Unknown Teacher';
                  } else {
                    teacherName = 'Teacher ID: ' + appointment.teacher;
                  }
                }
                
                // Handle both populated and unpopulated subject objects
                let subjectName = 'Unknown Subject';
                if (appointment.subject) {
                  if (typeof appointment.subject === 'object') {
                    subjectName = appointment.subject.name || 'Unknown Subject';
                  } else {
                    subjectName = 'Subject ID: ' + appointment.subject;
                  }
                }
                
                const statusText = appointment.status || 'Unknown';

                return (
                  <tr key={appointment._id}>
                    <td>{subjectName}</td>
                    <td>{teacherName}</td>
                    <td>{dateTime.date}</td>
                    <td>{dateTime.time}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(statusText)}`}>
                        {statusText.charAt(0).toUpperCase() + statusText.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="view-details-btn"
                          onClick={() => onAppointmentClick && onAppointmentClick(appointment)}
                          title="View details"
                        >
                          <Eye size={16} />
                          View
                        </button>
                        {statusText.toLowerCase() !== 'cancelled' && statusText.toLowerCase() !== 'completed' && (
                          <button
                            className="cancel-action-btn"
                            onClick={() => handleCancel(appointment._id)}
                            disabled={loading}
                            title="Cancel appointment"
                          >
                            <Trash2 size={16} />
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentAppointments;
