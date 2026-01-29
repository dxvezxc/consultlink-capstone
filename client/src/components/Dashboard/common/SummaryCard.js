// Summary Card Component
// Card component for displaying statistics

import React from 'react';
import '../../../styles/summary-card.css';

export default function SummaryCard({ title, count, color = 'blue', icon = null }) {
  const getColorClass = () => {
    const colors = {
      'blue': 'bg-blue',
      'green': 'bg-green',
      'orange': 'bg-orange',
      'red': 'bg-red',
      'purple': 'bg-purple'
    };
    return colors[color] || colors['blue'];
  };

  return (
    <div className={`summary-card ${getColorClass()}`}>
      <div className="card-icon">
        {icon || (
          <span className="icon-placeholder">
            {count}
          </span>
        )}
      </div>
      <div className="card-content">
        <h3>{title}</h3>
        <p className="card-count">{count}</p>
      </div>
    </div>
  );
}
