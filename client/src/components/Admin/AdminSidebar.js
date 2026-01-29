// client/src/components/Admin/AdminSidebar.js
import React from 'react';
import {
  FaChalkboardTeacher,
  FaBook,
  FaCalendarAlt,
  FaChartBar,
} from 'react-icons/fa';

const AdminSidebar = () => {
  return (
    <aside className="admin-sidebar">
      <h2 className="logo">ConsultLink</h2>

      <nav>
        <button className="sidebar-link active">
          <FaChartBar /> Dashboard
        </button>

        <button className="sidebar-link">
          <FaChalkboardTeacher /> Teachers
        </button>

        <button className="sidebar-link">
          <FaBook /> Subjects
        </button>

        <button className="sidebar-link">
          <FaCalendarAlt /> Appointments
        </button>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
