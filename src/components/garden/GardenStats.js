import React, { useState } from 'react';
import { getTotalStats, getWeeklyStats } from '../../utils/analytics';
import { calculateLevel } from '../../utils/levelCalculator';

const GardenStats = () => {
  const [activeTab, setActiveTab] = useState('stories');
  const weeklyStats = getWeeklyStats();
  const totalStats = getTotalStats();
  const levelInfo = calculateLevel(totalStats.totalPomodoros);
  
  // Get harvest history from localStorage or create simulated data
  const getHarvestHistory = () => {
    try {
      const storedHistory = localStorage.getItem('pomoHarvestHistory');
      if (storedHistory) {
        return JSON.parse(storedHistory);
      }
    } catch (error) {
      console.error('Error reading harvest history:', error);
    }
    
    // Simulated harvest history (replace with actual data)
    return [
      { 
        id: 1, 
        type: 'carrot', 
        status: 'success', 
        completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        focusTime: 7500, // 2h 5m in seconds
        pomodoros: 5
      },
      { 
        id: 2, 
        type: 'tomato', 
        status: 'failed',
        wilted: true,
        completedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        focusTime: 3600, // 1h in seconds
        pomodoros: 0
      },
      {
        id: 3,
        type: 'wheat',
        status: 'failed',
        earlyBreak: true,
        completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        focusTime: 1200, // 20m in seconds
        pomodoros: 0
      }
    ];
  };

  const harvestHistory = getHarvestHistory();
  
  // Format time display
  const formatFocusTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours === 0) {
      return `${minutes}m`;
    }
    
    return `${hours}h ${minutes}m`;
  };
  
  // Format date display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Calculate day name
  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };
  
  // Generate calendar days for monthly view
  const generateCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, focus: 0 });
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i).toISOString().split('T')[0];
      const dayStats = weeklyStats.find(stat => stat.date === date) || { pomodoros: 0, focusMinutes: 0 };
      
      days.push({
        day: i,
        focus: dayStats.focusMinutes,
        pomodoros: dayStats.pomodoros
      });
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays();

  // Calculate harvest success rate
  const calculateHarvestSuccessRate = () => {
    if (harvestHistory.length === 0) return 0;
    
    const successfulHarvests = harvestHistory.filter(h => h.status === 'success').length;
    return Math.round((successfulHarvests / harvestHistory.length) * 100);
  };
  
  return (
    <div className="mt-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-display font-bold">Garden Statistics</h2>
          <div className="text-gray-500 dark:text-gray-400">
            <span className="font-medium text-primary-500">{formatFocusTime(totalStats.totalFocusTime)}</span> this week • 
            <span className="font-medium text-primary-500 ml-1">{totalStats.totalPomodoros}</span> Plants Harvested
          </div>
        </div>
        
        <div className="flex space-x-2 mb-6">
          <button
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'stories'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setActiveTab('stories')}
          >
            My Harvests
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'stats'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setActiveTab('stats')}
          >
            Stats
          </button>
        </div>
        
        {activeTab === 'stories' ? (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Gardener Level</h3>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold mr-3">
                  {levelInfo.level}
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-500 transition-all duration-1000"
                      style={{ width: `${Math.min(levelInfo.progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1 text-gray-500 dark:text-gray-400">
                    <span>{levelInfo.currentLevelXP} / {levelInfo.xpForNextLevel} XP</span>
                    <span>{Math.round(levelInfo.progress)}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Streak System */}
            <div className="mb-4 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Plant Growth System</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="w-5 h-5 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mr-2">🌱</span>
                  <span>1 Pomodoro = 1 sprout</span>
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mr-2">🌿</span>
                  <span>4 Pomodoros = full plant</span>
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mr-2">💀</span>
                  <span>Failed session = plant withers</span>
                </li>
              </ul>
              
              {/* Show harvest success rate */}
              <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Harvest Success Rate:</span>
                  <span className="font-medium">{calculateHarvestSuccessRate()}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                  <div 
                    className="h-1.5 bg-green-500 rounded-full"
                    style={{ width: `${calculateHarvestSuccessRate()}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mb-3">Harvest History</h3>
            {harvestHistory.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-6">
                No harvests yet. Complete focus sessions to grow plants!
              </p>
            ) : (
              <ul className="space-y-3">
                {harvestHistory.map(harvest => (
                  <li key={harvest.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className={`w-10 h-10 ${
                      harvest.status === 'success' 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-red-100 dark:bg-red-900/30'
                    } rounded-full flex items-center justify-center mr-3`}>
                      {harvest.type === 'carrot' && '🥕'}
                      {harvest.type === 'tomato' && '🍅'}
                      {harvest.type === 'wheat' && '🌾'}
                      {harvest.type === 'corn' && '🌽'}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium capitalize">{harvest.type}</h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(harvest.completedAt)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className={harvest.status === 'success' ? 'text-green-500' : 'text-red-500'}>
                          {harvest.status === 'success' 
                            ? 'Harvested' 
                            : harvest.wilted 
                              ? 'Wilted' 
                              : harvest.earlyBreak 
                                ? 'Early Break' 
                                : 'Failed'}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {formatFocusTime(harvest.focusTime)} • {harvest.pomodoros || 0} pomodoro{harvest.pomodoros !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div>
            {/* Daily Stats */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-3">Today's Harvests</h3>
              <div className="flex items-center">
                <div className="relative w-24 h-24">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="10"
                      className="dark:stroke-gray-700"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="10"
                      strokeDasharray="283"
                      strokeDashoffset={283 - (283 * (weeklyStats[weeklyStats.length - 1]?.focusMinutes || 0) / 120)}
                      transform="rotate(-90 50 50)"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold">{weeklyStats[weeklyStats.length - 1]?.focusMinutes || 0}m</span>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-medium">Focus Time</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Goal: 2h daily</p>
                  
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-primary-500 mr-2"></div>
                      <span className="text-sm">Focus Time</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Harvest Type Breakdown */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-3">Harvest Types</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Successful Harvests */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-green-700 dark:text-green-400">Successful</h4>
                    <span className="text-2xl">🌱</span>
                  </div>
                  <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                    {harvestHistory.filter(h => h.status === 'success').length}
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Completed focus sessions
                  </p>
                </div>
                
                {/* Failed Harvests */}
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-red-700 dark:text-red-400">Failed</h4>
                    <span className="text-2xl">💀</span>
                  </div>
                  <div className="text-3xl font-bold text-red-700 dark:text-red-400">
                    {harvestHistory.filter(h => h.status === 'failed').length}
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    Broken focus sessions
                  </p>
                </div>
                
                {/* Longest Focus */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400">Longest Focus</h4>
                    <span className="text-2xl">⏱️</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {formatFocusTime(Math.max(...harvestHistory.map(h => h.focusTime || 0), 0))}
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Your record session
                  </p>
                </div>
                
                {/* Total Plants */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-purple-700 dark:text-purple-400">Total Pomodoros</h4>
                    <span className="text-2xl">🍅</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                    {harvestHistory.reduce((sum, h) => sum + (h.pomodoros || 0), 0)}
                  </div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                    Grown in your garden
                  </p>
                </div>
              </div>
            </div>
            
            {/* Weekly Stats */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-3">Weekly Harvests</h3>
              <div className="h-40">
                <div className="h-32 flex items-end justify-between">
                  {weeklyStats.map((day, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-8 bg-primary-500 rounded-t transition-all duration-500"
                        style={{ 
                          height: `${Math.min((day.focusMinutes / 120) * 100, 100)}%`,
                          minHeight: day.focusMinutes > 0 ? '4px' : '0'
                        }}
                      ></div>
                      <div className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                        {getDayName(day.date)}
                      </div>
                      <div className="text-xs font-medium">
                        {day.focusMinutes}m
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex mt-2">
                <div className="flex items-center mr-4">
                  <div className="w-3 h-3 rounded-full bg-primary-500 mr-2"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">This week</span>
                </div>
              </div>
            </div>
            
            {/* Monthly Stats */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-3">Monthly Garden View</h3>
              <div className="mb-3 text-center text-sm text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
                    {day}
                  </div>
                ))}
                
                {calendarDays.map((day, i) => (
                  <div 
                    key={i} 
                    className={`h-10 rounded-md flex items-center justify-center ${
                      day.day === null 
                        ? '' 
                        : day.focus > 0
                          ? 'bg-primary-100 dark:bg-primary-900/30'
                          : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    {day.day !== null && (
                      <div className="text-sm relative">
                        {day.day}
                        {day.pomodoros > 0 && (
                          <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center">
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Plant Growth Distribution */}
            <div>
              <h3 className="text-lg font-medium mb-3">Plant Distribution</h3>
              
              <div className="grid grid-cols-4 gap-2 mb-4">
                {['carrot', 'wheat', 'tomato', 'corn'].map((type) => {
                  const count = harvestHistory.filter(h => h.type === type).length;
                  const emoji = type === 'carrot' ? '🥕' : type === 'wheat' ? '🌾' : type === 'tomato' ? '🍅' : '🌽';
                  const label = type.charAt(0).toUpperCase() + type.slice(1);
                  const typeTime = type === 'carrot' ? '15m' : type === 'wheat' ? '25m' : type === 'tomato' ? '30m' : '45m+';
                  
                  return (
                    <div key={type} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">{emoji}</div>
                      <div className="text-sm font-medium">{label}</div>
                      <div className="text-xs text-gray-500">{typeTime}</div>
                      <div className="text-lg font-bold mt-1">{count}</div>
                    </div>
                  );
                })}
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Focus longer to grow different types of plants!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GardenStats;