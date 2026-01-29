import React from 'react';
import { Search, Filter, Grid, List, Calendar } from 'lucide-react';

const AppointmentFilters = ({ filters, onFilterChange, viewMode, onViewModeChange, userRole }) => {
  const statusOptions = userRole === 'teacher' 
    ? [
        { value: 'all', label: 'All Appointments' },
        { value: 'pending', label: 'Pending Requests' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ]
    : [
        { value: 'all', label: 'All Appointments' },
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Upcoming' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'upcoming', label: 'Upcoming' }
  ];

  const sortOptions = [
    { value: 'date-desc', label: 'Date (Newest First)' },
    { value: 'date-asc', label: 'Date (Oldest First)' },
    { value: 'status', label: 'Status' }
  ];

  return (
    <div className="appointment-filters">
      <div className="filters-row">
        {/* Search Input */}
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search appointments..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            className="search-input"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="view-mode-toggle">
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onViewModeChange('list')}
            title="List View"
          >
            <List size={18} />
          </button>
          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            title="Grid View"
          >
            <Grid size={18} />
          </button>
          <button 
            className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => onViewModeChange('calendar')}
            title="Calendar View"
          >
            <Calendar size={18} />
          </button>
        </div>
      </div>

      <div className="filters-row">
        {/* Status Filter */}
        <div className="filter-group">
          <label className="filter-label">
            <Filter size={16} />
            Status
          </label>
          <div className="filter-options">
            {statusOptions.map(option => (
              <button
                key={option.value}
                className={`filter-option ${filters.status === option.value ? 'active' : ''}`}
                onClick={() => onFilterChange({ ...filters, status: option.value })}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="filter-group">
          <label className="filter-label">Date Range</label>
          <div className="filter-options">
            {dateRangeOptions.map(option => (
              <button
                key={option.value}
                className={`filter-option ${filters.dateRange === option.value ? 'active' : ''}`}
                onClick={() => onFilterChange({ ...filters, dateRange: option.value })}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="filter-group">
          <label className="filter-label">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value })}
            className="sort-select"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default AppointmentFilters;