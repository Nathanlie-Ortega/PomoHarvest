import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getWeeklyStats, getTotalStats } from '../../utils/analytics';
import { calculateLevel } from '../../utils/levelCalculator';
import { Bar } from 'recharts';

const Stats = () => {
  const { currentUser } = useAuth();
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [totalStats, setTotalStats] = useState({
    totalPomodoros: 0,
    totalFocusTime: 0,
    totalHours: 0,
    remainingMinutes: 0,
    currentStreak: 0
  });
  const [levelInfo, setLevelInfo] = useState({
    level: 1,
    progress: 0,
    totalXP: 0
  });
  
  useEffect(() => {
    // Load stats
    const weekly = getWeeklyStats();
    const totals = getTotalStats();
    const level = calculateLevel(totals.totalPomodoros);
    
    setWeeklyStats(weekly);
    setTotalStats(totals);
    setLevelInfo(level);
  }, [currentUser]);
  
  const formatDay = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };
  
  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-display font-medium mb-1">Total Pomodoros</h3>
          <p className="text-3xl font-bold text-primary-500">{totalStats.totalPomodoros}</p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-display font-medium mb-1">Focus Time</h3>
          <p className="text-3xl font-bold text-primary-500">
            {totalStats.totalHours}<span className="text-lg">h</span> {totalStats.remainingMinutes}<span className="text-lg">m</span>
          </p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-display font-medium mb-1">Current Streak</h3>
          <p className="text-3xl font-bold text-primary-500">{totalStats.currentStreak} <span className="text-lg">days</span></p>
        </div>
      </div>
      
      {/* Level Progress */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-display font-medium">Gardener Level</h3>
          <span className="text-2xl font-bold text-primary-500">Level {levelInfo.level}</span>
        </div>
        
        <div className="mb-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-500 transition-all duration-1000"
              style={{ width: `${levelInfo.progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{levelInfo.currentLevelXP} / {levelInfo.xpForNextLevel} XP</span>
          <span>{Math.round(levelInfo.progress)}% to Level {levelInfo.level + 1}</span>
        </div>
      </div>
      
      {/* Weekly Chart */}
      <div className="card p-6">
        <h3 className="text-lg font-display font-medium mb-6">This Week's Activity</h3>
        
        <div className="h-64">
          {weeklyStats.length > 0 ? (
            <div className="h-full">
              {/* For a real implementation, use Recharts or a similar library */}
              <div className="flex h-48 items-end justify-between">
                {weeklyStats.map((day, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-10 bg-primary-500 rounded-t"
                      style={{ 
                        height: `${(day.pomodoros / Math.max(...weeklyStats.map(d => d.pomodoros || 1), 1)) * 100}%`,
                        minHeight: day.pomodoros > 0 ? '20px' : '4px'
                      }}
                    ></div>
                    <div className="text-xs mt-2">{formatDay(day.date)}</div>
                    <div className="text-xs font-medium">{day.pomodoros}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">No data available for this week</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stats;