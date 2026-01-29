// Booking Page
// Allows students to book consultations with teachers

import React, { useState } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import BookingCalendar from '../components/Booking/BookingCalendar';
import TeacherSelector from '../components/Booking/TeacherSelector';
import TimeSlotPicker from '../components/Booking/TimeSlotPicker';
import consultationsAPI from '../api/consultations';
import '../styles/booking.css';

export default function BookingPage() {
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const handleBooking = async () => {
    if (!selectedTeacher || !selectedDate || !selectedTime) {
      alert('Please select all required fields');
      return;
    }

    try {
      // Combine date and time for dateTime field
      const [hours, minutes] = selectedTime.split(':');
      const dateTime = new Date(selectedDate);
      dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      await consultationsAPI.createConsultation({
        teacherId: selectedTeacher._id,
        subjectId: selectedTeacher.subjects?.[0],
        dateTime: dateTime.toISOString(),
        notes: ''
      });
      
      alert('Consultation booked successfully!');
      // Reset form
      setSelectedTeacher(null);
      setSelectedDate(null);
      setSelectedTime(null);
    } catch (error) {
      alert('Error booking consultation: ' + error.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="booking-page">
        <h1>Book a Consultation</h1>

        <div className="booking-container">
          <div className="booking-step">
            <h2>Step 1: Select Teacher</h2>
            <TeacherSelector 
              onTeacherSelect={setSelectedTeacher}
              selectedTeacher={selectedTeacher}
            />
          </div>

          {selectedTeacher && (
            <div className="booking-step">
              <h2>Step 2: Select Date & Time</h2>
              <BookingCalendar 
                teacherId={selectedTeacher._id}
                onDateSelect={setSelectedDate}
                selectedDate={selectedDate}
              />
            </div>
          )}

          {selectedDate && (
            <div className="booking-step">
              <h2>Step 3: Select Time Slot</h2>
              <TimeSlotPicker 
                teacherId={selectedTeacher._id}
                selectedDate={selectedDate}
                onTimeSelect={setSelectedTime}
                selectedTime={selectedTime}
              />
            </div>
          )}

          {selectedTeacher && selectedDate && selectedTime && (
            <div className="booking-summary">
              <h2>Booking Summary</h2>
              <p><strong>Teacher:</strong> {selectedTeacher.name}</p>
              <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {selectedTime}</p>
              <button onClick={handleBooking} className="btn-primary">Confirm Booking</button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
