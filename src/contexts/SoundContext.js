import React, { createContext, useState, useEffect } from 'react';

export const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const savedPreference = localStorage.getItem('soundEnabled');
      return savedPreference !== null ? JSON.parse(savedPreference) : true;
    } catch (error) {
      console.error('Error reading sound preference from localStorage:', error);
      return true;
    }
  });
  
  useEffect(() => {
    try {
      localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
    } catch (error) {
      console.error('Error saving sound preference to localStorage:', error);
    }
  }, [soundEnabled]);
  
  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };
  
  return (
    <SoundContext.Provider value={{ soundEnabled, toggleSound }}>
      {children}
    </SoundContext.Provider>
  );
};