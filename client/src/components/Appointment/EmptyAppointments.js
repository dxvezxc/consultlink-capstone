import React from 'react';
import { Calendar, Plus, Filter } from 'lucide-react';

const EmptyAppointments = ({ filters, userRole, onNewBooking, onClearFilters }) => {
  const hasActiveFilters = filters.status !== 'all' || 
                          filters.dateRange !== 'all' || 
                          filters.searchQuery !== '';

  const getEmptyMessage = () => {
    if (hasActiveFilters) {
      return `No appointments found with the current filters.`;
    }
    
    return userRole === 'student' 
      ? "You haven't booked any consultations yet."
      : "You don't have any appointment requests yet.";
  };

  const getSuggestion = () => {
    if (hasActiveFilters) {
      return "Try clearing your filters or adjusting your search criteria.";
    }
    
    return userRole === 'student'
      ? "Book your first consultation to get started!"
      : "Your appointment requests will appear here when students book with you.";
  };

  return (
    <div className="empty-appointments">
      <div className="empty-icon">
        <Calendar size={64} />
      </div>
      
      <h3>{getEmptyMessage()}</h3>
      <p className="empty-suggestion">{getSuggestion()}</p>
      
      <div className="empty-actions">
        {hasActiveFilters ? (
          <button 
            className="action-btn clear-filters-btn"
            onClick={onClearFilters}
          >
            <Filter size={18} />
            Clear All Filters
          </button>
        ) : userRole === 'student' ? (
          <button 
            className="action-btn new-booking-btn"
            onClick={onNewBooking}
          >
            <Plus size={18} />
            Book Your First Consultation
          </button>
        ) : (
          <div className="teacher-empty-actions">
            <p className="teacher-tip">
              💡 <strong>Tip:</strong> Set your availability to start receiving appointment requests.
            </p>
            <button 
              className="action-btn availability-btn"
              onClick={onNewBooking}
            >
              Set Availability
            </button>
          </div>
        )}
      </div>
      
      {!hasActiveFilters && userRole === 'teacher' && (
        <div className="teacher-guidance">
          <h4>Getting Started as a Teacher</h4>
          <ul className="guidance-list">
            <li>Set your availability for consultations</li>
            <li>Students will see you as available and can book appointments</li>
            <li>Review and approve/reject incoming requests</li>
            <li>Manage your schedule from this dashboard</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default EmptyAppointments;