// Dashboard Page
// Main dashboard page that routes to user-specific dashboards

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import StudentDashboard from '../components/Dashboard/StudentDashboard';
import TeacherDashboard from '../components/Dashboard/TeacherDashboard';
import AdminDashboard from '../components/Dashboard/AdminDashboard';
import { DashboardLayout } from '../components/Layout/DashboardLayout';

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to access dashboard</div>;
  }

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        {user.role === 'student' && <StudentDashboard />}
        {user.role === 'teacher' && <TeacherDashboard />}
        {user.role === 'admin' && <AdminDashboard />}
      </div>
    </DashboardLayout>
  );
}
