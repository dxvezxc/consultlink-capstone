import React from 'react';
import { Clock, CheckCircle, Users, TrendingUp, Calendar } from 'lucide-react';

const TeacherSummaryCards = ({ stats }) => {
  const cards = [
    {
      id: 'pending',
      title: 'Pending Requests',
      value: stats.pendingRequests || 0,
      icon: <Clock size={24} />,
      color: '#f59e0b',
      bgColor: '#fffbeb',
      change: '+2 today',
      link: 'requests'
    },
    {
      id: 'today',
      title: "Today's Consultations",
      value: stats.todayConsultations || 0,
      icon: <Calendar size={24} />,
      color: '#3b82f6',
      bgColor: '#eff6ff',
      change: 'Next in 2 hours',
      link: 'schedule'
    },
    {
      id: 'students',
      title: 'Active Students',
      value: stats.totalStudents || 0,
      icon: <Users size={24} />,
      color: '#10b981',
      bgColor: '#ecfdf5',
      change: '+3 this week',
      link: 'students'
    },
    {
      id: 'hours',
      title: 'Weekly Hours',
      value: `${stats.thisWeek || 0}h`,
      icon: <Clock size={24} />,
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      change: '18h scheduled',
      link: 'availability'
    },
    {
      id: 'completed',
      title: 'Completed This Month',
      value: '42',
      icon: <CheckCircle size={24} />,
      color: '#ef4444',
      bgColor: '#fef2f2',
      change: '↑ 12% from last month',
      link: null
    },
    {
      id: 'rating',
      title: 'Average Rating',
      value: '4.8',
      icon: <TrendingUp size={24} />,
      color: '#f59e0b',
      bgColor: '#fffbeb',
      change: 'Based on 24 reviews',
      link: null
    }
  ];

  return (
    <div className="teacher-summary-cards">
      {cards.map((card) => (
        <div 
          key={card.id} 
          className="summary-card"
          style={{ borderLeft: `4px solid ${card.color}` }}
        >
          <div className="card-content">
            <div className="card-icon" style={{ backgroundColor: card.bgColor, color: card.color }}>
              {card.icon}
            </div>
            <div className="card-stats">
              <h3 className="card-value">{card.value}</h3>
              <p className="card-title">{card.title}</p>
            </div>
          </div>
          <div className="card-footer">
            <span className="card-change" style={{ color: card.color }}>
              {card.change}
            </span>
            {card.link && (
              <button className="card-action">
                View Details →
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeacherSummaryCards;