import React from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react';

const AppointmentStats = ({ stats, userRole, onFilterChange }) => {
  const statCards = userRole === 'teacher' 
    ? [
        {
          id: 'pending',
          title: 'Pending Requests',
          value: stats.pending,
          icon: <AlertCircle size={24} />,
          color: '#f59e0b',
          bgColor: '#fffbeb',
          filter: { status: 'pending' }
        },
        {
          id: 'confirmed',
          title: 'Confirmed',
          value: stats.confirmed,
          icon: <CheckCircle size={24} />,
          color: '#10b981',
          bgColor: '#ecfdf5',
          filter: { status: 'confirmed' }
        },
        {
          id: 'upcoming',
          title: 'Upcoming Today',
          value: stats.upcoming,
          icon: <Clock size={24} />,
          color: '#3b82f6',
          bgColor: '#eff6ff',
          filter: { dateRange: 'today' }
        },
        {
          id: 'total',
          title: 'Total Appointments',
          value: stats.total,
          icon: <Calendar size={24} />,
          color: '#8b5cf6',
          bgColor: '#f5f3ff',
          filter: { status: 'all', dateRange: 'all' }
        }
      ]
    : [
        {
          id: 'upcoming',
          title: 'Upcoming',
          value: stats.upcoming,
          icon: <Clock size={24} />,
          color: '#3b82f6',
          bgColor: '#eff6ff',
          filter: { status: 'confirmed', dateRange: 'upcoming' }
        },
        {
          id: 'pending',
          title: 'Pending',
          value: stats.pending,
          icon: <AlertCircle size={24} />,
          color: '#f59e0b',
          bgColor: '#fffbeb',
          filter: { status: 'pending' }
        },
        {
          id: 'completed',
          title: 'Completed',
          value: stats.completed,
          icon: <CheckCircle size={24} />,
          color: '#10b981',
          bgColor: '#ecfdf5',
          filter: { status: 'completed' }
        },
        {
          id: 'cancelled',
          title: 'Cancelled',
          value: stats.cancelled,
          icon: <XCircle size={24} />,
          color: '#ef4444',
          bgColor: '#fef2f2',
          filter: { status: 'cancelled' }
        }
      ];

  return (
    <div className="appointment-stats">
      {statCards.map(stat => (
        <div 
          key={stat.id} 
          className="stat-card"
          onClick={() => onFilterChange(stat.filter)}
          style={{ 
            borderLeft: `4px solid ${stat.color}`,
            cursor: 'pointer' 
          }}
        >
          <div className="stat-content">
            <div className="stat-icon" style={{ backgroundColor: stat.bgColor, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-title">{stat.title}</p>
            </div>
          </div>
          <div className="stat-footer">
            <span className="stat-action">View →</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AppointmentStats;