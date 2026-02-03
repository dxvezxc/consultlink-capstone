import React from 'react';
import { Clock, CheckCircle, AlertCircle, TrendingUp, Calendar } from 'lucide-react';

const StudentSummaryCards = ({ stats, onCardClick }) => {
  const cards = [
    {
      id: 'pending',
      title: 'Pending Requests',
      value: stats.pending || 0,
      icon: <Clock size={24} />,
      color: '#f59e0b',
      bgColor: '#fffbeb',
      change: '+1 this week',
      link: 'appointments'
    },
    {
      id: 'approved',
      title: 'Approved',
      value: stats.approved || 0,
      icon: <Calendar size={24} />,
      color: '#3b82f6',
      bgColor: '#eff6ff',
      change: 'Next: Tomorrow at 2 PM',
      link: 'appointments'
    },
    {
      id: 'completed',
      title: 'Completed Sessions',
      value: stats.completed || 0,
      icon: <CheckCircle size={24} />,
      color: '#10b981',
      bgColor: '#ecfdf5',
      change: '+3 this month',
      link: 'appointments'
    },
    {
      id: 'cancelled',
      title: 'Cancelled',
      value: stats.cancelled || 0,
      icon: <AlertCircle size={24} />,
      color: '#ef4444',
      bgColor: '#fef2f2',
      change: 'Last: 1 week ago',
      link: 'appointments'
    },
    {
      id: 'hours',
      title: 'Total Hours',
      value: `${stats.totalHours || 0}h`,
      icon: <Clock size={24} />,
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      change: '↑ Learning progress',
      link: null
    }
  ];

  const handleCardClick = (cardId, cardLink) => {
    if (onCardClick && cardLink) {
      onCardClick(cardLink, cardId);
    }
  };

  return (
    <div className="student-summary-cards">
      {cards.map((card) => (
        <div 
          key={card.id} 
          className={`summary-card ${card.link ? 'clickable' : ''}`}
          style={{ borderLeft: `4px solid ${card.color}` }}
          onClick={() => handleCardClick(card.id, card.link)}
          role={card.link ? 'button' : 'status'}
          tabIndex={card.link ? 0 : -1}
          onKeyPress={(e) => {
            if (card.link && (e.key === 'Enter' || e.key === ' ')) {
              handleCardClick(card.id, card.link);
            }
          }}
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
              <button 
                className="card-action"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(card.id, card.link);
                }}
              >
                View Details →
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentSummaryCards;