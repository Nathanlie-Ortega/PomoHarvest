// src/components/layout/ThemeToggle.js
import React, { useState, useEffect } from 'react';

const ThemeToggle = ({ isFocusPage = false }) => {
  // CHANGED: Start with dark mode (night mode) as default on Focus Page
  const [isNightMode, setIsNightMode] = useState(true);
  
  useEffect(() => {
    // CHANGED: Only apply theme changes on Focus Page, start with dark mode
    if (isFocusPage) {
      if (isNightMode) {
        document.body.classList.add('night-mode');
        document.documentElement.classList.add('dark');
      } else {
        document.body.classList.remove('night-mode');
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isNightMode, isFocusPage]);
  
  // CHANGED: Initialize with dark mode on mount for Focus Page
  useEffect(() => {
    if (isFocusPage) {
      document.body.classList.add('night-mode');
      document.documentElement.classList.add('dark');
    }
  }, [isFocusPage]);
  
  // CHANGED: Don't render anything if not on Focus Page
  if (!isFocusPage) {
    return null;
  }
  
  const toggleTheme = () => {
    setIsNightMode(prev => !prev);
  };
  
  
};

export default ThemeToggle;