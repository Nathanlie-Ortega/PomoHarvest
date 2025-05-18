import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      // Check localStorage first
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      // If no saved preference, check system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (error) {
      console.error('Error reading theme preference from localStorage:', error);
      return false;
    }
  });
  
  useEffect(() => {
    try {
      // Save preference to localStorage
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
      
      // Apply theme to document
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Error saving theme preference to localStorage:', error);
    }
  }, [darkMode]);
  
  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };
  
  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};