import React, { useState, useEffect } from 'react';
import { 
  getLevelAndXP, 
  resetLevelAndXP, 
  getCurrentStreak, 
  getTodaysFocusTime, 
  formatTimeForDisplay 
} from '../../utils/statsSync';
import { 
  getHarvestHistory, 
  getHarvestStats, 
  formatDate 
} from '../../utils/harvestHistory';

const GardenStats = () => {
  const [activeTab, setActiveTab] = useState('harvests');
  const [levelData, setLevelData] = useState({});
  const [harvestHistory, setHarvestHistory] = useState([]);
  const [harvestStats, setHarvestStats] = useState({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [todaysFocus, setTodaysFocus] = useState(0);
  const [showResetModal, setShowResetModal] = useState(false);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [showAllHarvests, setShowAllHarvests] = useState(false);

  // Load all data
  const loadData = () => {
    const level = getLevelAndXP();
    const history = getHarvestHistory();
    const stats = getHarvestStats();
    const streak = getCurrentStreak();
    const todayFocus = getTodaysFocusTime();

    setLevelData(level);
    setHarvestHistory(history);
    setHarvestStats(stats);
    setCurrentStreak(streak);
    setTodaysFocus(todayFocus);

    // Generate weekly data for chart
    generateWeeklyData(history);
    generateMonthlyData(stats);
  };

  const generateWeeklyData = (history) => {
    const weekData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-CA');
      
      // Count harvests for this day from history
      const dayHarvests = history.filter(harvest => {
        const harvestDate = new Date(harvest.date).toLocaleDateString('en-CA');
        return harvestDate === dateStr;
      });
      
      const harvested = dayHarvests.filter(h => h.status === 'harvested').length;
      const wilted = dayHarvests.filter(h => h.status === 'wilted').length;

      weekData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: dateStr,
        harvested: harvested,
        wilted: wilted,
        total: harvested + wilted
      });
    }
    
    setWeeklyData(weekData);
  };

  const generateMonthlyData = (stats) => {
    const monthData = [];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      monthData.push({ day: null, hasActivity: false });
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i).toLocaleDateString('en-CA');
      const dayStats = stats.weeklyStats?.find(day => day.date === date);
      const hasActivity = dayStats && (dayStats.harvested > 0 || dayStats.wilted > 0);
      
      monthData.push({
        day: i,
        date,
        hasActivity
      });
    }
    
    setMonthlyData(monthData);
  };

  useEffect(() => {
    loadData();
    
    // Listen for updates from FocusPage
    const handleStorageChange = () => {
      loadData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('statsUpdated', handleStorageChange);
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadData, 10000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('statsUpdated', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleReset = () => {
    const success = resetLevelAndXP();
    if (success) {
      // Dispatch a custom event to notify Garden component about the reset
      window.dispatchEvent(new CustomEvent('gardenReset'));
      
      // Reload data in this component
      loadData();
      setShowResetModal(false);
      
      console.log('Reset completed and garden reset event dispatched');
    }
  };

  const getPlantEmoji = (plantType) => {
      const emojis = {
        carrot: '🥕',
        tomato: '🍅',
        wheat: '🌾',
        corn: '🌽'
      };
      return emojis[plantType] || '🌱';
    };

  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      {/* Header with Stats */}


    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-display font-bold">Garden Statistics</h2>
      <div className="flex items-center space-x-6 text-sm">
        <span className="font-medium text-primary-500">
          {formatTimeForDisplay(todaysFocus)} this day
        </span>
        <span className="text-gray-400">•</span>
        <span className="font-medium text-primary-500">
          {harvestStats.totalHarvested || 0} Plants Harvested
        </span>
        <span className="text-gray-400">•</span>
        <span className="font-medium text-red-500">
          {harvestStats.totalWilted || 0} Plants Wilted
        </span>
      </div>
    </div>


      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-6">
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'harvests'
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
          onClick={() => setActiveTab('harvests')}
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

      {activeTab === 'harvests' ? (
        <div className="space-y-6">
          {/* Gardener Level */}
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Gardener Level</h3>
              <button
                onClick={() => setShowResetModal(true)}
                className="text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 px-3 py-1 rounded transition-colors"
              >
                Reset Level
              </button>
            </div>
            
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold mr-4 text-xl">
                {levelData.level || 1}
              </div>
              <div className="flex-1">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-primary-500 transition-all duration-1000"
                    style={{ width: `${levelData.percentage || 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>{levelData.currentXP || 0} / {levelData.nextLevelXP || 10} XP</span>
                  <span>{levelData.percentage || 0}% to Level {(levelData.level || 1) + 1}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Harvest History */}
          <div>
            <h3 className="text-lg font-medium mb-4">Harvest History</h3>
            {harvestHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">🌱</div>
                <p>No harvests yet. Complete focus sessions to grow plants!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {harvestHistory.slice(0, showAllHarvests ? harvestHistory.length : 5).map(harvest => (
                  <div key={harvest.id} className="flex items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className={`w-12 h-12 ${
                      harvest.status === 'harvested' 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-red-100 dark:bg-red-900/30'
                    } rounded-full flex items-center justify-center mr-4`}>
                      <span className="text-2xl">{getPlantEmoji(harvest.plantType)}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium capitalize">{harvest.plantType}</h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatFullDate(harvest.date)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className={`text-sm font-medium ${
                          harvest.status === 'harvested' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {harvest.status === 'harvested' ? 'Harvested' : 'Wilted'}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatTimeForDisplay(harvest.focusTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* View All Harvests button */}
                {harvestHistory.length > 5 && (
                  <div className="text-center mt-4">
                    <button 
                      onClick={() => setShowAllHarvests(!showAllHarvests)}
                      className="btn-outline text-sm"
                    >
                      {showAllHarvests ? 'Show Less' : 'View All Harvests'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="space-y-8">
          {/* Today's Stats with Circles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Time Consumed Circle */}


            <div className="flex items-center">
              <div className="relative w-24 h-24 mr-6">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    className="dark:stroke-gray-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="8"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * Math.min(todaysFocus / 7200, 1))} // 2 hour max
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{formatTimeForDisplay(todaysFocus)}</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Time Consumed</h4>
                <div className="flex items-center mt-1">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm text-gray-500">Focus Time</span>
                </div>
              </div>
            </div>

            {/* Your Streak Circle */}
            <div className="flex items-center">
              <div className="relative w-24 h-24 mr-6">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    className="dark:stroke-gray-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="8"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * Math.min(currentStreak / 30, 1))} // 30 day max
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{currentStreak}</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Your Streak</h4>
                <div className="flex items-center mt-1">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm text-gray-500">Days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Harvest Types */}
          <div>
            <h3 className="text-lg font-medium mb-4">Harvest Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Successful */}
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-green-700 dark:text-green-400">Successful</h4>
                </div>
                <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                  {harvestStats.totalHarvested || 0}
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Completed focus sessions
                </p>
              </div>
              

              {/* Failed */}
              <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-red-700 dark:text-red-400">Failed</h4>
                </div>
                <div className="text-3xl font-bold text-red-700 dark:text-red-400">
                  {harvestHistory.filter(h => h.status === 'wilted' || h.status === 'failed').length || 0}
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Wilted plants
                </p>
              </div>




            </div>
          </div>

          {/* Weekly Harvests */}
          <div>
            <h3 className="text-lg font-medium mb-4">Weekly Harvests</h3>
            <div className="h-40">
              <div className="h-32 flex items-end justify-between">
                {weeklyData.map((day, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-8 bg-primary-500 rounded-t transition-all duration-500"
                      style={{ 
                        height: `${Math.min((day.total / Math.max(...weeklyData.map(d => d.total || 1), 1)) * 100, 100)}%`,
                        minHeight: day.total > 0 ? '8px' : '4px'
                      }}
                    ></div>
                    <div className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                      {day.day}
                    </div>
                    <div className="text-xs font-medium">
                      {day.total}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex mt-2">

              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-gray-500">Today's Focus</span>
              </div>


              </div>
            </div>
          </div>

          {/* Monthly Garden View */}
          <div>
            <h3 className="text-lg font-medium mb-4">Monthly Garden View</h3>
            <div className="mb-3 text-center text-sm text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
                  {day}
                </div>
              ))}
              
              {monthlyData.map((day, i) => (
                <div 
                  key={i} 
                  className={`h-10 rounded-md flex items-center justify-center ${
                    day.day === null 
                      ? '' 
                      : day.hasActivity
                        ? 'bg-primary-100 dark:bg-primary-900/30'
                        : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  {day.day !== null && (
                    <div className="text-sm">
                      {day.day}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Plant Distribution */}
          <div>
            <h3 className="text-lg font-medium mb-4">Plant Distribution</h3>
            
            <div className="grid grid-cols-4 gap-4 mb-4">
            {['carrot', 'tomato', 'wheat', 'corn'].map((type) => {
              // ONLY count successfully harvested plants
              const count = harvestHistory.filter(harvest => harvest.plantType === type && harvest.status === 'harvested').length;
              const emoji = getPlantEmoji(type);
              const label = type.charAt(0).toUpperCase() + type.slice(1);
                
                return (
                  <div key={type} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">{emoji}</div>
                    <div className="text-sm font-medium">{label}</div>
                    <div className="text-2xl font-bold mt-2">{count}</div>
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

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
              Reset Gardener Level?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to reset your level? This will permanently delete all your XP progress, harvest history, and statistics. This action cannot be undone.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GardenStats;