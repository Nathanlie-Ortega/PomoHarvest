import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // CHANGED: Default to dark mode always (except Focus Page which handles its own theme)
  const [darkMode, setDarkMode] = useState(true);
  
  useEffect(() => {
    // CHANGED: Always apply dark mode globally
    document.documentElement.classList.add('dark');
  }, []);
  
  const toggleTheme = () => {
    // CHANGED: Theme toggle is now handled by Focus Page only
    // This function is kept for compatibility but doesn't change global theme
    console.log('Global theme toggle disabled - Focus Page handles its own theme');
  };
  
  return (
    <ThemeContext.Provider value={{ darkMode: true, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};