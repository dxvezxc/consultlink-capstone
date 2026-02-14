// Admin Dashboard
// Dashboard view for admin users

import React from 'react';
import { useFetch } from '../../hooks/useFetch';
import SummaryCard from './common/SummaryCard';

export default function AdminDashboard() {
  const { data: stats } = useFetch('/admin/stats');

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="dashboard-cards">
        <SummaryCard title="Total Users" count={stats?.users?.total || 0} color="blue" />
        <SummaryCard title="Total Consultations" count={stats?.consultations?.total || 0} color="green" />
        <SummaryCard title="Pending Requests" count={stats?.consultations?.pending || 0} color="orange" />
        <SummaryCard title="Completed" count={stats?.consultations?.completed || 0} color="purple" />
      </div>

      <div className="admin-stats-detailed">
        {stats && (
          <>
            <div className="stat-group">
              <h3>Users</h3>
              <ul>
                <li>Students: {stats.users?.students || 0}</li>
                <li>Teachers: {stats.users?.teachers || 0}</li>
                <li>Admins: {stats.users?.admins || 0}</li>
              </ul>
            </div>

            <div className="stat-group">
              <h3>Consultations</h3>
              <ul>
                <li>Approved: {stats.consultations?.approved || 0}</li>
                <li>Rejected: {stats.consultations?.rejected || 0}</li>
                <li>Cancelled: {stats.consultations?.cancelled || 0}</li>
              </ul>
            </div>

            <div className="stat-group">
              <h3>System</h3>
              <ul>
                <li>Total Subjects: {stats.subjects || 0}</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}