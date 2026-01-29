// Time Slot Picker Component
// Component for selecting a time slot

import React, { useState, useEffect } from 'react';
import consultationsAPI from '../../api/consultations';
import '../../styles/time-slot-picker.css';

export default function TimeSlotPicker({ teacherId, selectedDate, onTimeSelect, selectedTime }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      try {
        setLoading(true);
        const response = await consultationsAPI.getAvailableSlots(
          teacherId,
          null,
          selectedDate
        );
        setSlots(response.slots || []);
      } catch (error) {
        console.error('Error fetching available slots:', error);
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    if (teacherId && selectedDate) {
      fetchAvailableSlots();
    }
  }, [teacherId, selectedDate]);

  if (loading) return <div>Loading available slots...</div>;

  return (
    <div className="time-slot-picker">
      {slots.length > 0 ? (
        <div className="slots-grid">
          {slots.map((slot, index) => (
            <button
              key={index}
              className={`slot-button ${selectedTime === slot.startTime ? 'selected' : ''}`}
              onClick={() => onTimeSelect(slot.startTime)}
            >
              {slot.startTime}
            </button>
          ))}
        </div>
      ) : (
        <p>No available slots for this date</p>
      )}
    </div>
  );
}
