// src/hooks/useSound.js
import { useCallback } from 'react';

/**
 * Custom hook for playing sound effects
 */
export const useSound = () => {
  /**
   * Play a sound effect
   * @param {string} soundType - The type of sound to play ('start', 'pause', 'complete', 'error', etc.)
   */
  const playSound = useCallback((soundType) => {
    // Get the appropriate sound URL based on the type
    let soundUrl = '';
    
    switch (soundType) {
      case 'start':
        soundUrl = '/assets/sounds/start.mp3';
        break;
      case 'pause':
        soundUrl = '/assets/sounds/pause.mp3';
        break;
      case 'complete':
        soundUrl = '/assets/sounds/complete.mp3';
        break;
      case 'reset':
        soundUrl = '/assets/sounds/reset.mp3';
        break;
      case 'error':
        soundUrl = '/assets/sounds/error.mp3';
        break;
      default:
        soundUrl = '/assets/sounds/click.mp3';
    }
    
    // Create and play the audio
    try {
      const audio = new Audio(soundUrl);
      audio.volume = 0.5; // Set volume to 50%
      audio.play().catch(e => {
        // Handle any errors with sound playback
        console.log('Audio play error:', e);
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, []);
  
  return { playSound };
};

export default useSound;