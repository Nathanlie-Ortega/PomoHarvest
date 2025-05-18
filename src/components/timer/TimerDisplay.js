import React from 'react';
import { formatTime } from '../../utils/formatTime';

const TimerDisplay = ({ time, isBreak }) => {
  return (
    <div className="text-center">
      <div className={`text-6xl font-bold font-mono ${isBreak ? 'text-secondary-500' : 'text-primary-500'}`}>
        {formatTime(time)}
      </div>
    </div>
  );
};

export default TimerDisplay;