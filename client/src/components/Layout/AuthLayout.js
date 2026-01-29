// Auth Layout Component
// Layout for authentication pages (login, register)

import React from 'react';
import '../../styles/auth.css';

export function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-header">
          <h1>ConsultLink</h1>
          <p>Student Consultation Platform</p>
        </div>
        
        <div className="auth-content">
          {children}
        </div>

        <div className="auth-footer">
          <p>&copy; 2024 ConsultLink. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
