// Main Layout Component
// Default layout for public pages

import React from 'react';
import Footer from '../Shared/Footer';
import '../../styles/layout.css';

export function MainLayout({ children }) {
  return (
    <div className="main-layout">
      <header className="main-header">
        <div className="header-container">
          <h1>ConsultLink</h1>
          <nav>
            <a href="/">Home</a>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;
