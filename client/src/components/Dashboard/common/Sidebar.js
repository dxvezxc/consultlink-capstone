// Sidebar Component
// Navigation sidebar for dashboard

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Menu, X } from 'lucide-react';
import '../../../styles/dashboard.css';

export default function Sidebar({ isOpen, onToggle }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getMenuItems = () => {
    const commonItems = [
      { label: 'Dashboard', path: '/dashboard' }
    ];

    const studentItems = [
      { label: 'Book Consultation', path: '/booking' },
      { label: 'My Appointments', path: '/appointments' }
    ];

    const teacherItems = [
      { label: 'Manage Availability', path: '/availability' },
      { label: 'My Consultations', path: '/appointments' }
    ];

    const adminItems = [
      { label: 'Admin Panel', path: '/admin' },
      { label: 'Users', path: '/admin/users' },
      { label: 'Reports', path: '/admin/reports' }
    ];

    let items = commonItems;
    if (user?.role === 'student') items = [...items, ...studentItems];
    if (user?.role === 'teacher') items = [...items, ...teacherItems];
    if (user?.role === 'admin') items = [...items, ...adminItems];

    return items;
  };

  return (
    <>
      <button className="sidebar-toggle" onClick={onToggle}>
        {isOpen ? <X /> : <Menu />}
      </button>

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>ConsultLink</h2>
        </div>

        <nav className="sidebar-nav">
          {getMenuItems().map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <p>{user?.name}</p>
            <small>{user?.role}</small>
          </div>
          <button onClick={logout} className="btn-logout">Logout</button>
        </div>
      </aside>
    </>
  );
}
