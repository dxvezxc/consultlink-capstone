// Teacher Dashboard
// Dashboard view for teacher users

import React from 'react';
import { useFetch } from '../../hooks/useFetch';
import SummaryCard from './common/SummaryCard';

export default function TeacherDashboard() {
  const { data: consultations } = useFetch('/api/consultations/all');

  const pendingCount = consultations?.filter(c => c.status === 'pending').length || 0;
  const approvedCount = consultations?.filter(c => c.status === 'approved').length || 0;
  const completedCount = consultations?.filter(c => c.status === 'completed').length || 0;

  return (
    <div className="teacher-dashboard">
      <h1>Teacher Dashboard</h1>

      <div className="dashboard-cards">
        <SummaryCard title="Pending Approvals" count={pendingCount} color="orange" />
        <SummaryCard title="Approved Consultations" count={approvedCount} color="blue" />
        <SummaryCard title="Completed Consultations" count={completedCount} color="green" />
      </div>

      <div className="dashboard-section">
        <h2>Pending Requests</h2>
        {consultations && consultations.filter(c => c.status === 'pending').length > 0 ? (
          <ul>
            {consultations.filter(c => c.status === 'pending').map(consultation => (
              <li key={consultation._id}>
                {consultation.title} - {consultation.student?.name}
              </li>
            ))}
          </ul>
        ) : (
          <p>No pending requests</p>
        )}
      </div>
    </div>
  );
}