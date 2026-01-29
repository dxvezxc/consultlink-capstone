// Admin Page
// Admin dashboard for managing system

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import adminAPI from '../api/admin';
import '../styles/admin.css';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <DashboardLayout>
      <div className="admin-page">
        <h1>Admin Dashboard</h1>

        <div className="admin-tabs">
          <button 
            onClick={() => setActiveTab('overview')}
            className={activeTab === 'overview' ? 'active' : ''}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={activeTab === 'users' ? 'active' : ''}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab('consultations')}
            className={activeTab === 'consultations' ? 'active' : ''}
          >
            Consultations
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={activeTab === 'reports' ? 'active' : ''}
          >
            Reports
          </button>
        </div>

        {activeTab === 'overview' && stats && (
          <div className="admin-stats">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p>{stats.users?.total || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Total Consultations</h3>
              <p>{stats.consultations?.total || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Pending</h3>
              <p>{stats.consultations?.pending || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Completed</h3>
              <p>{stats.consultations?.completed || 0}</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}