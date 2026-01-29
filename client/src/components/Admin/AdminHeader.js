// client/src/components/Admin/AdminHeader.js
import React from 'react';
import { FaBell, FaUserCircle } from 'react-icons/fa';

const AdminHeader = () => {
  return (
    <header className="admin-header">
      <h3>Dashboard</h3>

      <div className="header-actions">
        <input type="text" placeholder="Search..." />

        <FaBell className="icon" />
        <FaUserCircle className="icon profile" />
      </div>
    </header>
  );
};

export default AdminHeader;