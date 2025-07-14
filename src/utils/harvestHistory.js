// src/utils/harvestHistory.js

const HARVEST_HISTORY_KEY = 'harvestHistory';

export const getHarvestHistory = () => {
  try {
    const history = localStorage.getItem(HARVEST_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error reading harvest history:', error);
    return [];
  }
};

export const addHarvestEntry = (plantType, status, focusTime, sessionDate = new Date()) => {
  try {
    const history = getHarvestHistory();
    const newEntry = {
      id: Date.now(),
      plantType: plantType.toLowerCase(),
      status: status, // 'harvested' or 'wilted'
      focusTime: focusTime, // in seconds
      date: sessionDate.toISOString(),
      timestamp: Date.now()
    };
    
    // Add to beginning of array (most recent first)
    history.unshift(newEntry);
    
    localStorage.setItem(HARVEST_HISTORY_KEY, JSON.stringify(history));
    console.log('Added harvest entry:', newEntry);
    
    return newEntry;
  } catch (error) {
    console.error('Error adding harvest entry:', error);
    return null;
  }
};

export const clearHarvestHistory = () => {
  try {
    localStorage.removeItem(HARVEST_HISTORY_KEY);
    console.log('Harvest history cleared');
    return true;
  } catch (error) {
    console.error('Error clearing harvest history:', error);
    return false;
  }
};

export const getHarvestStats = () => {
  const history = getHarvestHistory();
  
  const stats = {
    totalHarvested: history.filter(entry => entry.status === 'harvested').length,
    totalWilted: history.filter(entry => entry.status === 'wilted').length,
    plantDistribution: {
      carrot: 0,
      tomato: 0,
      wheat: 0
    },
    todayStats: {
      harvested: 0,
      wilted: 0,
      focusTime: 0
    },
    weeklyStats: [],
    monthlyStats: []
  };
  
  const today = new Date().toLocaleDateString('en-CA');
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  history.forEach(entry => {
    const entryDate = new Date(entry.date);
    const entryDateString = entryDate.toLocaleDateString('en-CA');
    
    // Plant distribution - only count harvested, subtract wilted
    if (entry.status === 'harvested') {
      if (stats.plantDistribution[entry.plantType] !== undefined) {
        stats.plantDistribution[entry.plantType]++;
      }
    } else if (entry.status === 'wilted') {
      if (stats.plantDistribution[entry.plantType] !== undefined) {
        stats.plantDistribution[entry.plantType] = Math.max(0, stats.plantDistribution[entry.plantType] - 1);
      }
    }
    
    // Today's stats
    if (entryDateString === today) {
      if (entry.status === 'harvested') {
        stats.todayStats.harvested++;
        stats.todayStats.focusTime += entry.focusTime || 0;
      } else if (entry.status === 'wilted') {
        stats.todayStats.wilted++;
      }
    }
    
    // Weekly stats
    if (entryDate >= startOfWeek) {
      let dayStats = stats.weeklyStats.find(day => day.date === entryDateString);
      if (!dayStats) {
        dayStats = {
          date: entryDateString,
          harvested: 0,
          wilted: 0,
          focusTime: 0
        };
        stats.weeklyStats.push(dayStats);
      }
      
      if (entry.status === 'harvested') {
        dayStats.harvested++;
        dayStats.focusTime += entry.focusTime || 0;
      } else if (entry.status === 'wilted') {
        dayStats.wilted++;
      }
    }
  });
  
  // Sort weekly stats by date
  stats.weeklyStats.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return stats;
};

export const formatFocusTime = (seconds) => {
  if (!seconds || seconds < 60) return '0m';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};