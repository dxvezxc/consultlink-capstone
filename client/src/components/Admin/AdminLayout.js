// client/src/components/Admin/AdminLayout.js
import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import '../../styles/adminDashboard.css';

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-dashboard">
      <AdminSidebar />

      <div className="admin-main">
        <AdminHeader />
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;