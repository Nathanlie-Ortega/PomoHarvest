import React from 'react';
import { formatTime } from '../../utils/formatTime';

const TimerDisplay = ({ time, isBreak, sessionFailed, showWitheredMessage }) => {
  return (
    <div className="text-center">
      <div className={`text-6xl font-bold font-mono ${
        sessionFailed || showWitheredMessage
          ? 'text-red-500 dark:text-red-400' 
          : isBreak 
            ? 'text-secondary-500 dark:text-secondary-400' 
            : 'text-primary-500 dark:text-primary-400'
      }`}>
        {formatTime(time)}
      </div>
      {sessionFailed && !isBreak && (
        <div className="mt-4 text-red-600 dark:text-red-400">
          ⚠️ Your harvest is wilting due to excessive pauses!
        </div>
      )}
      {showWitheredMessage && !isBreak && (
        <div className="mt-4 text-red-600 dark:text-red-400">
          ⚠️ You left your crops unattended. No growth earned this cycle.
        </div>
      )}
    </div>
  );
};

export default TimerDisplay;