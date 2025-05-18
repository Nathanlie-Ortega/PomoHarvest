import { useContext, useCallback } from 'react';
import { SoundContext } from '../contexts/SoundContext';

export const useSound = () => {
  const { soundEnabled } = useContext(SoundContext);
  
  const playSound = useCallback((soundName) => {
    if (!soundEnabled) return;
    
    try {
      const audio = new Audio(`/assets/sounds/${soundName}.mp3`);
      audio.play();
    } catch (error) {
      console.error(`Error playing sound "${soundName}":`, error);
    }
  }, [soundEnabled]);
  
  return { playSound };
};