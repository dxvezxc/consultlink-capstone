// Time Slot Picker Component
// Component for selecting a time slot from teacher's availability

import React, { useState, useEffect } from 'react';
import consultationsAPI from '../../api/consultations';
import '../../styles/time-slot-picker.css';

// Helper function to convert time string "HH:MM" to minutes since midnight
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper function to convert minutes since midnight to "HH:MM"
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

// Generate all bookable time slots from availability ranges
const generateTimeSlots = (availabilitySlots) => {
  const timeSlots = [];
  
  if (!availabilitySlots || availabilitySlots.length === 0) {
    return timeSlots;
  }

  availabilitySlots.forEach(slot => {
    const startMinutes = timeToMinutes(slot.startTime);
    const endMinutes = timeToMinutes(slot.endTime);
    const slotDuration = slot.slotDuration || 30; // Default 30 minutes

    // Generate slots at intervals of slotDuration
    for (let currentMinutes = startMinutes; currentMinutes + slotDuration <= endMinutes; currentMinutes += slotDuration) {
      timeSlots.push({
        time: minutesToTime(currentMinutes),
        startMinutes: currentMinutes,
        endMinutes: currentMinutes + slotDuration,
        duration: slotDuration
      });
    }
  });

  return timeSlots;
};

export default function TimeSlotPicker({ teacherId, subjectId, selectedDate, onTimeSelect, selectedTime }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (!teacherId || !subjectId || !selectedDate) {
          setSlots([]);
          return;
        }

        const response = await consultationsAPI.getAvailableSlots(
          teacherId,
          subjectId,
          selectedDate
        );
        
        const availabilitySlots = response.slots || [];
        const bookableSlots = generateTimeSlots(availabilitySlots);
        setSlots(bookableSlots);
        
        if (bookableSlots.length === 0 && availabilitySlots.length === 0) {
          setError('No availability set for this date');
        }
      } catch (error) {
        console.error('Error fetching available slots:', error);
        setError('Failed to load available slots');
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [teacherId, subjectId, selectedDate]);

  if (loading) {
    return (
      <div className="time-slot-picker loading">
        <p>Loading available times...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="time-slot-picker error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="time-slot-picker">
      {slots.length > 0 ? (
        <div className="slots-grid">
          {slots.map((slot, index) => (
            <button
              key={index}
              className={`slot-button ${selectedTime === slot.time ? 'selected' : ''}`}
              onClick={() => onTimeSelect(slot.time)}
              title={`${slot.time} - ${minutesToTime(slot.endMinutes)}`}
            >
              {slot.time}
            </button>
          ))}
        </div>
      ) : (
        <p>No available slots for this date</p>
      )}
    </div>
  );
}
