// client/src/components/Booking/BookingForm.js
import React, { useState } from 'react';
import API from '../../api/axios';
import '../../styles/studentDashboard.css';

const BookingForm = ({ subject, teacher, consultant, onBack, onSuccess }) => {
  const [dateTime, setDateTime] = useState('');
  const [loading, setLoading] = useState(false);

  // Use 'consultant' if 'teacher' is not provided
  const teacherData = teacher || consultant;

  // Validate required data
  if (!subject || !teacherData) {
    return (
      <div className="booking-container">
        <div className="booking-card error-card">
          <h2>Error: Missing Data</h2>
          <p>Unable to load subject or teacher information.</p>
          <button className="cancel-btn" onClick={onBack}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleBook = async () => {
    if (!dateTime) {
      alert('Please select date and time');
      return;
    }

    try {
      setLoading(true);
      
      console.log('Booking appointment with data:', {
        teacherId: teacherData._id,
        subjectId: subject._id,
        dateTime,
      });
      
      const response = await API.post('/appointments', {
        teacherId: teacherData._id,
        subjectId: subject._id,
        dateTime,
      });

      console.log('Booking response:', response);
      alert('Appointment booked successfully!');
      
      // Call success callback if provided, otherwise go back
      if (onSuccess) {
        onSuccess();
      } else {
        onBack();
      }
    } catch (err) {
      console.error('Booking error:', err);
      const errorMsg = err.error || err.msg || err.message || 'Booking failed';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-container">
      <div className="booking-card">
        <h2 className="booking-title">
          Book <span>{subject.name}</span> with{' '}
          <span>{teacherData.name || teacherData.studentID || 'Teacher'}</span>
        </h2>

        <label className="booking-label">Select Date & Time</label>
        <input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          className="booking-input"
          disabled={loading}
        />

        <div className="booking-actions">
          <button 
            className="book-btn" 
            onClick={handleBook}
            disabled={loading}
          >
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
          <button 
            className="cancel-btn" 
            onClick={onBack}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;