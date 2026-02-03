// client/src/components/Admin/AdminSidebar.js
import React, { useState } from 'react';
import {
  FaChalkboardTeacher,
  FaBook,
  FaCalendarAlt,
  FaChartBar,
} from 'react-icons/fa';

const AdminSidebar = ({ onNavigate, activeSection }) => {
  const handleNavigation = (section) => {
    if (onNavigate) {
      onNavigate(section);
    }
  };

  return (
    <aside className="admin-sidebar">
      <h2 className="logo">ConsultLink</h2>

      <nav>
        <button 
          className={`sidebar-link ${activeSection === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleNavigation('dashboard')}
        >
          <FaChartBar /> Dashboard
        </button>

        <button 
          className={`sidebar-link ${activeSection === 'teachers' ? 'active' : ''}`}
          onClick={() => handleNavigation('teachers')}
        >
          <FaChalkboardTeacher /> Teachers
        </button>

        <button 
          className={`sidebar-link ${activeSection === 'subjects' ? 'active' : ''}`}
          onClick={() => handleNavigation('subjects')}
        >
          <FaBook /> Subjects
        </button>

        <button 
          className={`sidebar-link ${activeSection === 'appointments' ? 'active' : ''}`}
          onClick={() => handleNavigation('appointments')}
        >
          <FaCalendarAlt /> Appointments
        </button>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
