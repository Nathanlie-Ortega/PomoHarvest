import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useSound } from './useSound';

export const useTimer = () => {
  // Get settings from localStorage or use defaults
  const [settings] = useLocalStorage('timerSettings', {
    pomodoro: 25 * 60, // 25 minutes in seconds
    shortBreak: 5 * 60, // 5 minutes
    longBreak: 15 * 60, // 15 minutes
    longBreakInterval: 4 // After 4 pomodoros
  });
  
  const [time, setTime] = useState(settings.pomodoro);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  
  const { playSound } = useSound();
  
  // Reset timer to initial state based on mode
  const resetTimer = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setTime(isBreak ? 
      (completedPomodoros % settings.longBreakInterval === 0 ? 
        settings.longBreak : settings.shortBreak)
      : settings.pomodoro
    );
  }, [isBreak, completedPomodoros, settings]);
  
  // Start the timer
  const startTimer = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
  }, []);
  
  // Pause the timer
  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);
  
  // Resume the timer
  const resumeTimer = useCallback(() => {
    setIsPaused(false);
  }, []);
  
  // Complete a pomodoro and start break
  const completePomodoro = useCallback(() => {
    setCompletedPomodoros(prev => prev + 1);
    setIsBreak(true);
    setIsActive(true);
    setIsPaused(false);
    
    // Determine if it's time for a long break
    const isLongBreak = (completedPomodoros + 1) % settings.longBreakInterval === 0;
    setTime(isLongBreak ? settings.longBreak : settings.shortBreak);
    
    // Play completion sound
    playSound('complete');
    
    // Log completed pomodoro in local storage for stats
    const today = new Date().toISOString().split('T')[0];
    const stats = JSON.parse(localStorage.getItem('pomoStats') || '{}');
    
    if (!stats[today]) {
      stats[today] = {
        completed: 0,
        totalFocusTime: 0
      };
    }
    
    stats[today].completed += 1;
    stats[today].totalFocusTime += settings.pomodoro;
    
    localStorage.setItem('pomoStats', JSON.stringify(stats));
  }, [completedPomodoros, settings, playSound]);
  
  // Skip the break
  const skipBreak = useCallback(() => {
    setIsBreak(false);
    setTime(settings.pomodoro);
    setIsActive(false);
    setIsPaused(false);
  }, [settings.pomodoro]);
  
  // Timer logic - decrement time
  useEffect(() => {
    let interval = null;
    
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTime(time => {
          if (time <= 1) {
            clearInterval(interval);
            
            // If focus time is over, start break
            if (!isBreak) {
              completePomodoro();
            } else {
              // If break is over, prepare for next pomodoro
              setIsBreak(false);
              setIsActive(false);
              setTime(settings.pomodoro);
            }
            return 0;
          }
          
          return time - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, isPaused, completePomodoro, isBreak, settings.pomodoro]);
  
  return {
    time,
    isActive,
    isPaused,
    isBreak,
    completedPomodoros,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    completePomodoro,
    skipBreak
  };
};