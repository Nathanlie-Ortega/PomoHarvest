import React, { useState, useEffect } from 'react';
import { getTotalStats, getWeeklyStats } from '../../utils/analytics';
import { calculateLevel } from '../../utils/levelCalculator';

const Stats = () => {
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
    totalXP: 0,
    currentLevelXP: 0,
    xpForNextLevel: 100
  });
  const [plantStats, setPlantStats] = useState({
    carrot: 0,
    tomato: 0,
    wheat: 0,
    corn: 0
  });
  
  useEffect(() => {
    // Load stats
    const weekly = getWeeklyStats();
    const totals = getTotalStats();
    const level = calculateLevel(totals.totalPomodoros);
    
    setWeeklyStats(weekly);
    setTotalStats(totals);
    setLevelInfo(level);
    
    // Get plant stats
    const retrievePlantStats = () => {
      try {
        // Try to retrieve plant data from localStorage
        const plants = JSON.parse(localStorage.getItem('plants') || '[]');
        
        // Count plant types
        const counts = {
          carrot: 0,
          tomato: 0,
          wheat: 0,
          corn: 0
        };
        
        plants.forEach(plant => {
          if (counts[plant.type] !== undefined) {
            counts[plant.type]++;
          }
        });
        
        setPlantStats(counts);
      } catch (error) {
        console.error('Error retrieving plant stats:', error);
      }
    };
    
    retrievePlantStats();
  }, []);
  
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
        
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 mr-4 flex-shrink-0">
            {levelInfo.level < 5 ? (
              <span className="text-3xl">🌱</span>
            ) : levelInfo.level < 10 ? (
              <span className="text-3xl">🌿</span>
            ) : levelInfo.level < 15 ? (
              <span className="text-3xl">🌳</span>
            ) : (
              <span className="text-3xl">🌲</span>
            )}
          </div>
          
          <div className="flex-1">
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
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Level Benefits</h4>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            <li className="flex items-center">
              <span className="mr-2">🌱</span>
              <span className="text-gray-600 dark:text-gray-400">New plant types</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">🏆</span>
              <span className="text-gray-600 dark:text-gray-400">Special achievements</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">🎨</span>
              <span className="text-gray-600 dark:text-gray-400">Garden customization</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">🌟</span>
              <span className="text-gray-600 dark:text-gray-400">Leaderboard status</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Weekly Chart */}
      <div className="card p-6">
        <h3 className="text-lg font-display font-medium mb-6">This Week's Activity</h3>
        
        <div className="h-64">
          {weeklyStats.length > 0 ? (
            <div className="h-full">
              <div className="flex h-48 items-end justify-between">
                {weeklyStats.map((day, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-10 bg-primary-500 rounded-t transition-all duration-500"
                      style={{ 
                        height: `${Math.max((day.pomodoros / Math.max(...weeklyStats.map(d => d.pomodoros || 1), 1)) * 100, 5)}%`,
                        minHeight: day.pomodoros > 0 ? '20px' : '4px'
                      }}
                    ></div>
                    <div className="text-xs mt-2">{formatDay(day.date)}</div>
                    <div className="text-xs font-medium">{day.pomodoros}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex items-center">
                <div className="w-3 h-3 rounded-full bg-primary-500 mr-2"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Pomodoros completed</span>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center flex-col">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No data available for this week</p>
              <button 
                onClick={() => {
                  // Navigate to dashboard or focus page to start a session
                  window.location.href = "/dashboard";
                }}
                className="btn-primary text-sm"
              >
                Start Your First Session
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Plant Statistics */}
      <div className="card p-6">
        <h3 className="text-lg font-display font-medium mb-6">Your Garden</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { type: 'carrot', emoji: '🥕', name: 'Carrots', count: plantStats.carrot, color: 'bg-orange-100 dark:bg-orange-900/20' },
            { type: 'tomato', emoji: '🍅', name: 'Tomatoes', count: plantStats.tomato, color: 'bg-red-100 dark:bg-red-900/20' },
            { type: 'wheat', emoji: '🌾', name: 'Wheat', count: plantStats.wheat, color: 'bg-yellow-100 dark:bg-yellow-900/20' },
            { type: 'corn', emoji: '🌽', name: 'Corn', count: plantStats.corn, color: 'bg-green-100 dark:bg-green-900/20' }
          ].map((plant) => (
            <div key={plant.type} className={`${plant.color} rounded-lg p-4 text-center`}>
              <div className="text-3xl mb-2">{plant.emoji}</div>
              <div className="font-medium">{plant.name}</div>
              <div className="text-2xl font-bold mt-1">{plant.count}</div>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-md font-medium mb-2">Plant Growth System</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg flex items-center">
              <span className="text-2xl mr-3">🌱</span>
              <div>
                <div className="font-medium">1 Pomodoro</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">= 1 sprout</div>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg flex items-center">
              <span className="text-2xl mr-3">🌿</span>
              <div>
                <div className="font-medium">4 Pomodoros</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">= full plant</div>
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-center">
              <span className="text-2xl mr-3">💀</span>
              <div>
                <div className="font-medium">Failed Session</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">= plant withers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Growth Tips */}
      <div className="card p-6">
        <h3 className="text-lg font-display font-medium mb-4">Growing Tips</h3>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-full mr-3 flex-shrink-0">
              <span className="text-lg">🍅</span>
            </div>
            <div>
              <h4 className="font-medium">Focus Sessions</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Complete 25-minute sessions without interruption for best results. Stay focused on a single task during your session.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full mr-3 flex-shrink-0">
              <span className="text-lg">💧</span>
            </div>
            <div>
              <h4 className="font-medium">Take Proper Breaks</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Breaks are essential after completing sessions. Use this time to rest your mind, stretch, or hydrate.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded-full mr-3 flex-shrink-0">
              <span className="text-lg">⚠️</span>
            </div>
            <div>
              <h4 className="font-medium">Avoid Excessive Pauses</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Too many pauses or long interruptions can cause your harvest to wilt. Try to minimize distractions during focus time.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-full mr-3 flex-shrink-0">
              <span className="text-lg">🌱</span>
            </div>
            <div>
              <h4 className="font-medium">Consistency is Key</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Maintain a daily streak to level up faster. Regular focused work sessions grow the healthiest garden.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;