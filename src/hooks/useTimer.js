// src/hooks/useTimer.js
import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = (settings = {}) => {
  // Default settings
  const {
    focusHours = 0,
    focusMinutes = 25,
    breakMinutes = 5,
  } = settings;
  
  // Calculate initial seconds
  const initialSeconds = (focusHours * 3600) + (focusMinutes * 60);
  const initialBreakSeconds = breakMinutes * 60;
  
  // Timer states
  const [time, setTime] = useState(initialSeconds);
  const [breakTime, setBreakTime] = useState(initialBreakSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  
  // Stats tracking
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pauseStartTime, setPauseStartTime] = useState(null);
  const [totalPauseTime, setTotalPauseTime] = useState(0);
  const [pauseLimit] = useState(300); // 5 minutes pause limit
  const [sessionFailed, setSessionFailed] = useState(false);
  
  // Refs
  const timer = useRef(null);
  
  // Reset the timer
  const resetTimer = useCallback(() => {
    // Clear any active interval
    if (timer.current) {
      clearInterval(timer.current);
    }
    
    // Reset all states
    setTime(initialSeconds);
    setBreakTime(initialBreakSeconds);
    setIsActive(false);
    setIsPaused(false);
    setIsBreak(false);
    setElapsedTime(0);
    setPauseStartTime(null);
    setTotalPauseTime(0);
    setSessionFailed(false);
  }, [initialSeconds, initialBreakSeconds]);
  
  // Start the timer
  const startTimer = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
    
    // Set the timer to tick every second
    timer.current = setInterval(() => {
      setTime(prevTime => {
        if (prevTime <= 1) {
          // Timer completed
          clearInterval(timer.current);
          
          if (breakMinutes > 0) {
            // Start break timer
            setIsBreak(true);
            return 0;
          } else {
            // No break, complete session
            return 0;
          }
        }
        return prevTime - 1;
      });
      
      // Track elapsed time
      setElapsedTime(prev => prev + 1);
    }, 1000);
  }, [breakMinutes]);
  
  // Pause the timer
  const pauseTimer = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
    }
    
    setIsPaused(true);
    setPauseStartTime(Date.now());
  }, []);
  
  // Resume the timer
  const resumeTimer = useCallback(() => {
    setIsPaused(false);
    
    // Calculate pause duration
    if (pauseStartTime) {
      const pauseDuration = Math.floor((Date.now() - pauseStartTime) / 1000);
      const newTotalPauseTime = totalPauseTime + pauseDuration;
      setTotalPauseTime(newTotalPauseTime);
      
      // Check if pause limit exceeded
      if (newTotalPauseTime > pauseLimit && !sessionFailed) {
        setSessionFailed(true);
      }
    }
    
    // Resume the timer
    if (isBreak) {
      // Break timer logic
      timer.current = setInterval(() => {
        setBreakTime(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer.current);
            // End break
            setIsBreak(false);
            return initialBreakSeconds;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      // Focus timer logic
      timer.current = setInterval(() => {
        setTime(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer.current);
            
            if (breakMinutes > 0) {
              setIsBreak(true);
              return 0;
            } else {
              return 0;
            }
          }
          return prevTime - 1;
        });
        
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
  }, [isBreak, pauseLimit, pauseStartTime, sessionFailed, totalPauseTime, breakMinutes, initialBreakSeconds]);
  
  // Skip break and go back to focus
  const skipBreak = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
    }
    
    setIsBreak(false);
    setIsActive(false);
    setTime(initialSeconds);
    setBreakTime(initialBreakSeconds);
    setElapsedTime(0);
    setTotalPauseTime(0);
    setPauseStartTime(null);
    setSessionFailed(false);
  }, [initialSeconds, initialBreakSeconds]);
  
  // Complete a pomodoro
  const completePomodoro = useCallback(() => {
    // Calculate effective focus time
    const effectiveFocusTime = elapsedTime - totalPauseTime;
    
    // Determine if session was successful
    const isSuccessful = !sessionFailed && effectiveFocusTime >= 900; // at least 15 minutes
    
    // Return session stats
    return {
      focusTime: effectiveFocusTime,
      pauseTime: totalPauseTime,
      isSuccessful,
      completedAt: new Date().toISOString()
    };
  }, [elapsedTime, sessionFailed, totalPauseTime]);
  
  // Handle break request
  const handleBreak = useCallback(() => {
    if (!isBreak && breakMinutes > 0) {
      // If focus timer is still running, consider it an early break
      if (time > 0) {
        setSessionFailed(true);
      }
      
      if (timer.current) {
        clearInterval(timer.current);
      }
      
      setIsBreak(true);
      setBreakTime(initialBreakSeconds);
      
      // Start break timer
      timer.current = setInterval(() => {
        setBreakTime(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer.current);
            setIsBreak(false);
            return initialBreakSeconds;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
  }, [time, isBreak, breakMinutes, initialBreakSeconds]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, []);
  
  // Return the timer API
  return {
    time: isBreak ? breakTime : time,
    isActive,
    isPaused,
    isBreak,
    elapsedTime,
    totalPauseTime,
    pauseLimit,
    sessionFailed,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipBreak,
    completePomodoro,
    handleBreak
  };
};

export default useTimer;