// client/src/components/Booking/BookingForm.js
import React, { useState } from 'react';
import API from '../../api/axios';
import TimeSlotPicker from './TimeSlotPicker';
import '../../styles/booking.css';
import '../../styles/time-slot-picker.css';

const BookingForm = ({ subject, teacher, consultant, onBack, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedTime(''); // Reset time when date changes
    setError('');
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setError('');
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Combine date and time into ISO datetime string
      const dateObj = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const dateTime = dateObj.toISOString();

      console.log('Booking appointment with data:', {
        teacherId: teacherData._id,
        subjectId: subject._id,
        dateTime,
        selectedDate,
        selectedTime
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
      const errorMsg = err?.response?.data?.error || err?.message || 'Booking failed';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Get today's date to set as minimum
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="booking-container">
      <div className="booking-card">
        <h2 className="booking-title">
          Book <span>{subject.name}</span> with{' '}
          <span>{teacherData.name || teacherData.studentID || 'Teacher'}</span>
        </h2>

        <div className="booking-step">
          <label className="booking-label">Step 1: Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="booking-input"
            disabled={loading}
            min={today}
          />
          {selectedDate && (
            <p className="selected-info">
              Selected: {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          )}
        </div>

        {selectedDate && (
          <div className="booking-step">
            <label className="booking-label">Step 2: Select Time</label>
            <TimeSlotPicker 
              teacherId={teacherData._id}
              subjectId={subject._id}
              selectedDate={selectedDate}
              onTimeSelect={handleTimeSelect}
              selectedTime={selectedTime}
            />
            {selectedTime && (
              <p className="selected-info">
                Selected: {selectedTime}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="booking-error">
            <p>{error}</p>
          </div>
        )}

        <div className="booking-actions">
          <button 
            className="book-btn" 
            onClick={handleBook}
            disabled={loading || !selectedDate || !selectedTime}
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