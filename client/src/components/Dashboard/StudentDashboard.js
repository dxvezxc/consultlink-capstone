// Student Dashboard
// Dashboard view for student users

import React, { useState, useEffect } from 'react';
import { useFetch } from '../../hooks/useFetch';
import SummaryCard from './common/SummaryCard';

export default function StudentDashboard() {
  const { data: consultations } = useFetch('/api/consultations/user');

  const upcomingCount = consultations?.filter(c => c.status === 'approved').length || 0;
  const completedCount = consultations?.filter(c => c.status === 'completed').length || 0;
  const pendingCount = consultations?.filter(c => c.status === 'pending').length || 0;

  return (
    <div className="student-dashboard">
      <h1>Student Dashboard</h1>

      <div className="dashboard-cards">
        <SummaryCard title="Upcoming Consultations" count={upcomingCount} color="blue" />
        <SummaryCard title="Completed Consultations" count={completedCount} color="green" />
        <SummaryCard title="Pending Requests" count={pendingCount} color="orange" />
      </div>

      <div className="dashboard-section">
        <h2>Recent Consultations</h2>
        {consultations && consultations.length > 0 ? (
          <ul>
            {consultations.slice(0, 5).map(consultation => (
              <li key={consultation._id}>
                {consultation.title} - {consultation.status}
              </li>
            ))}
          </ul>
        ) : (
          <p>No consultations yet</p>
        )}
      </div>
    </div>
  );
}