// Notification Context
// Manages notification state across the application

import React, { createContext, useState, useCallback } from 'react';

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const addAlert = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now();
    const alert = { id, message, type };

    setAlerts(prev => [...prev, alert]);

    if (duration > 0) {
      setTimeout(() => {
        removeAlert(id);
      }, duration);
    }

    return id;
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const success = useCallback((message, duration = 5000) => {
    return addAlert(message, 'success', duration);
  }, [addAlert]);

  const error = useCallback((message, duration = 5000) => {
    return addAlert(message, 'error', duration);
  }, [addAlert]);

  const info = useCallback((message, duration = 5000) => {
    return addAlert(message, 'info', duration);
  }, [addAlert]);

  const warning = useCallback((message, duration = 5000) => {
    return addAlert(message, 'warning', duration);
  }, [addAlert]);

  const value = {
    alerts,
    addAlert,
    removeAlert,
    success,
    error,
    info,
    warning
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export default NotificationContext;
