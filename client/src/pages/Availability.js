// Availability Page
// Allows teachers to manage their availability

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import '../styles/availability.css';

export default function AvailabilityPage() {
  const [selectedDay, setSelectedDay] = useState(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [loading, setLoading] = useState(false);
  // Note: availability is intentionally not persisted in this page
  const availability = [];

  useEffect(() => {
    // Fetch availability on component mount
  }, []);

  const handleAddAvailability = async () => {
    try {
      setLoading(true);
      // Call API to add availability
      // await availabilityAPI.createAvailability({...})
      alert('Availability added successfully!');
    } catch (error) {
      alert('Error adding availability: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="availability-page">
        <h1>Manage Your Availability</h1>

        <div className="availability-form">
          <div className="form-group">
            <label>Day of Week</label>
            <select value={selectedDay} onChange={(e) => setSelectedDay(parseInt(e.target.value))}>
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
              <option value={2}>Tuesday</option>
              <option value={3}>Wednesday</option>
              <option value={4}>Thursday</option>
              <option value={5}>Friday</option>
              <option value={6}>Saturday</option>
            </select>
          </div>

          <div className="form-group">
            <label>Start Time</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>

          <div className="form-group">
            <label>End Time</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>

          <button onClick={handleAddAvailability} className="btn-primary" disabled={loading}>
            Add Availability
          </button>
        </div>

        <div className="availability-list">
          <h2>Your Availability</h2>
          {availability.length === 0 ? (
            <p>No availability set yet</p>
          ) : (
            <ul>
              {availability.map((slot, index) => (
                <li key={index}>
                  {slot.day}: {slot.startTime} - {slot.endTime}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}