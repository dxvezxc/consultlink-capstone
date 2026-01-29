// Theme Context
// Manages theme preferences (dark/light mode)

import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        localStorage.setItem('theme', 'dark');
        document.body.classList.add('dark-mode');
      } else {
        localStorage.setItem('theme', 'light');
        document.body.classList.remove('dark-mode');
      }
      return newMode;
    });
  };

  // Set theme explicitly
  const setTheme = (mode) => {
    if (mode === 'dark') {
      setIsDarkMode(true);
      localStorage.setItem('theme', 'dark');
      document.body.classList.add('dark-mode');
    } else {
      setIsDarkMode(false);
      localStorage.setItem('theme', 'light');
      document.body.classList.remove('dark-mode');
    }
  };

  const value = {
    isDarkMode,
    toggleTheme,
    setTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
