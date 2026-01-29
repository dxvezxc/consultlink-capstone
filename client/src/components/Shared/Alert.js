// Alert Component
// Reusable alert/toast component

import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import '../../styles/alert.css';

export default function Alert({ type = 'info', message, onClose, autoClose = true, duration = 5000 }) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'error': return <AlertCircle />;
      case 'success': return <CheckCircle />;
      case 'info':
      default: return <Info />;
    }
  };

  return (
    <div className={`alert alert-${type}`}>
      <div className="alert-content">
        <span className="alert-icon">{getIcon()}</span>
        <span className="alert-message">{message}</span>
      </div>
      <button className="alert-close" onClick={onClose}>
        <X size={18} />
      </button>
    </div>
  );
}