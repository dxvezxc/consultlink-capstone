// Appointments Page
// Lists appointments and allows management

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import consultationsAPI from '../api/consultations';
import '../styles/appointments.css';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await consultationsAPI.getUserConsultations({ status: filter === 'all' ? '' : filter });
        // The response contains consultations array from backend
        setAppointments(response.consultations || response.data || []);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [filter]);

  if (loading) return <div>Loading...</div>;

  return (
    <DashboardLayout>
      <div className="appointments-page">
        <h1>My Appointments</h1>

        <div className="filter-buttons">
          <button 
            onClick={() => setFilter('all')} 
            className={filter === 'all' ? 'active' : ''}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('pending')} 
            className={filter === 'pending' ? 'active' : ''}
          >
            Pending
          </button>
          <button 
            onClick={() => setFilter('confirmed')} 
            className={filter === 'confirmed' ? 'active' : ''}
          >
            Confirmed
          </button>
          <button 
            onClick={() => setFilter('completed')} 
            className={filter === 'completed' ? 'active' : ''}
          >
            Completed
          </button>
        </div>

        <div className="appointments-list">
          {appointments.length === 0 ? (
            <p>No appointments found</p>
          ) : (
            appointments.map(appointment => (
              <div key={appointment._id} className="appointment-card">
                <h3>Subject: {appointment.subject?.name || 'N/A'}</h3>
                <p>Status: {appointment.status}</p>
                <p>Date: {new Date(appointment.dateTime).toLocaleDateString()}</p>
                <p>Time: {new Date(appointment.dateTime).toLocaleTimeString()}</p>
                <p>Teacher: {appointment.teacher?.name || 'N/A'}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}