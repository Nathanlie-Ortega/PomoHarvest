import React, { useEffect, useState } from 'react';
import { useTimer } from '../../hooks/useTimer';
import TimerDisplay from './TimerDisplay';
import TimerControls from './TimerControls';
import PlantGrowth from './PlantGrowth';
import { useSound } from '../../hooks/useSound';

const Timer = () => {
  const { 
    time,
    isActive,
    isPaused,
    isBreak,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    completePomodoro,
    skipBreak
  } = useTimer();
  
  const { playSound } = useSound();
  const [growthStage, setGrowthStage] = useState(0);
  
  // Calculate plant growth stage based on time remaining
  useEffect(() => {
    if (!isPaused && isActive && !isBreak) {
      const initialTime = 25 * 60; // 25 minutes in seconds
      const progress = 1 - (time / initialTime);
      setGrowthStage(Math.floor(progress * 5)); // 5 growth stages
    }
  }, [time, isPaused, isActive, isBreak]);

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="card p-6">
        <h2 className="text-2xl font-display font-bold text-center mb-6">
          {isBreak ? 'Break Time' : 'Focus Time'}
        </h2>
        
        <div className="flex flex-col items-center space-y-8">
          <TimerDisplay time={time} isBreak={isBreak} />
          
          {!isBreak && (
            <div className="w-full">
              <PlantGrowth stage={growthStage} />
            </div>
          )}
          
          <TimerControls 
            isActive={isActive}
            isPaused={isPaused}
            isBreak={isBreak}
            onStart={() => {
              startTimer();
              playSound('start');
            }}
            onPause={() => {
              pauseTimer();
              playSound('pause');
            }}
            onResume={() => {
              resumeTimer();
              playSound('start');
            }}
            onReset={() => {
              resetTimer();
              playSound('reset');
            }}
            onSkipBreak={() => {
              skipBreak();
              playSound('reset');
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Timer;