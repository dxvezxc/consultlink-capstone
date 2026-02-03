import React from 'react';
import { Clock, Calendar } from 'lucide-react'; // eslint-disable-line no-unused-vars

const TeacherSummaryCards = ({ stats, onCardClick }) => {
  const cards = [
    {
      id: 'pending',
      title: 'Pending Requests',
      value: stats.pendingRequests || 0,
      icon: <Clock size={24} />,
      color: '#f59e0b',
      bgColor: '#fffbeb',
      change: 'Awaiting approval',
      link: 'requests'
    },
    {
      id: 'today',
      title: 'Today\'s Consultation',
      value: stats.todayConsultations || 0,
      icon: <Calendar size={24} />,
      color: '#10b981',
      bgColor: '#ecfdf5',
      change: 'Scheduled today',
      link: 'schedule'
    }
  ];

  const handleCardClick = (cardId, cardLink) => {
    if (onCardClick && cardLink) {
      onCardClick(cardLink, cardId);
    }
  };

  return (
    <div className="teacher-summary-cards">
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

export default TeacherSummaryCards;