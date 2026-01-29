// Dashboard Layout Component
// Wrapper for dashboard pages with sidebar and header

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from '../Dashboard/common/Sidebar';
import Header from '../Dashboard/common/Header';
import '../../styles/dashboard.css';

export function DashboardLayout({ children }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="dashboard-main">
        <Header user={user} onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
