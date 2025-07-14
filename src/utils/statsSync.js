// src/utils/statsSync.js
// Handles synchronization between FocusPage and Garden stats

import { addHarvestEntry, clearHarvestHistory } from './harvestHistory';

const LEVEL_XP_KEY = 'gardenerLevelXP';

export const getLevelAndXP = () => {
  try {
    // Get from localStorage (same as FocusPage uses)
    const savedStats = JSON.parse(localStorage.getItem('pomoStats') || '{}');
    let totalHarvestXP = 0;
    let totalWitherPenalty = 0;
    
    // Sum up harvest points and wither penalties - EXACTLY like FocusPage
    Object.values(savedStats).forEach(day => {
      if (day.harvestXP) totalHarvestXP += day.harvestXP;
      if (day.witherCount) totalWitherPenalty += day.witherCount;
    });
    
    // Calculate Garden XP - EXACTLY like FocusPage: 1 Harvest XP = 10 Garden XP, then subtract full wither penalty
    const totalGardenXP = Math.max(0, (totalHarvestXP * 10) - totalWitherPenalty);
    
    console.log(`Garden Stats XP Calculation: Harvest XP: ${totalHarvestXP}, Wither Penalty: ${totalWitherPenalty}, Final Garden XP: ${totalGardenXP}`);
    
    // Calculate level based on Fast Early Growth model - EXACTLY like FocusPage
    let level = 1;
    const xpLevels = [0, 10, 25, 45, 70, 100, 135, 175, 220]; // Cumulative XP needed for each level
    
    // Find the correct level - if XP is 10, we're at level 2 (since 10 ≤ 10 < 25)
    for (let i = 1; i < xpLevels.length; i++) {
      if (totalGardenXP >= xpLevels[i-1] && totalGardenXP < xpLevels[i]) {
        level = i;
        break;
      }
    }
    
    // Handle case where XP exactly matches a level threshold
    if (totalGardenXP >= 10 && totalGardenXP < 25) level = 2;
    else if (totalGardenXP >= 25 && totalGardenXP < 45) level = 3;
    else if (totalGardenXP >= 45 && totalGardenXP < 70) level = 4;
    // etc.
    
    // Handle beyond defined levels
    if (totalGardenXP >= xpLevels[xpLevels.length - 1]) {
      const lastGapIncrease = 40;
      level = Math.floor((totalGardenXP - xpLevels[xpLevels.length - 1]) / (lastGapIncrease + 5)) + xpLevels.length;
    }
    
    // Calculate next level XP and percentage - MATCH Focus Page EXACTLY
    let nextLevelXP;
    let percentage;
    
    if (level <= xpLevels.length) {
      // Within defined levels
      // If we're level 2, next level is 3, which requires xpLevels[2] = 25 XP total
      nextLevelXP = xpLevels[level] || xpLevels[xpLevels.length - 1];
      
      // Current level base XP - if level 2, base is xpLevels[0] = 10 (what we needed to GET to level 2)
      const currentLevelBaseXP = level > 1 ? xpLevels[level - 2] : 0;
      
      // XP needed from current level to next level 
      const xpNeededForNextLevel = nextLevelXP - currentLevelBaseXP;
      
      // XP progress within current level - if 10 total XP and level 2 base is 10, then progress is (10 - 10) = 0
      const xpProgressInCurrentLevel = totalGardenXP - currentLevelBaseXP;
      
      // Percentage toward next level
      percentage = Math.max(0, Math.round((xpProgressInCurrentLevel / xpNeededForNextLevel) * 100));
      
      console.log(`Level ${level}: Total XP: ${totalGardenXP}, Next Level XP: ${nextLevelXP}, Current Level Base: ${currentLevelBaseXP}, Progress in level: ${xpProgressInCurrentLevel}/${xpNeededForNextLevel}, Percentage: ${percentage}%`);
      
    } else {
      // Beyond defined levels
      const lastGapIncrease = 40;
      const baseXP = xpLevels[xpLevels.length - 1] + (level - xpLevels.length) * (lastGapIncrease + 5);
      nextLevelXP = baseXP + (lastGapIncrease + 5);
      const xpNeeded = lastGapIncrease + 5;
      const xpProgress = totalGardenXP - baseXP;
      percentage = Math.max(0, Math.round((xpProgress / xpNeeded) * 100));
    }
    
    // Return EXACTLY the same structure as FocusPage
    return {
      level,
      currentXP: totalGardenXP, // This should match FocusPage exactly (e.g., 10)
      xpProgress: totalGardenXP,
      nextLevelXP, // This should match FocusPage exactly (e.g., 25 for level 3)
      percentage,
      harvestXP: totalHarvestXP,
      witherPenalty: totalWitherPenalty
    };
    
  } catch (error) {
    console.error('Error calculating level and XP:', error);
    return {
      level: 1,
      currentXP: 0,
      xpProgress: 0,
      nextLevelXP: 10,
      percentage: 0,
      harvestXP: 0,
      witherPenalty: 0
    };
  }
};

export const resetLevelAndXP = () => {
  try {
    // Clear all stats
    localStorage.removeItem('pomoStats');
    localStorage.removeItem('lastSession');
    
    // Clear harvest history
    clearHarvestHistory();
    
    // Trigger leaderboard update for reset
    window.dispatchEvent(new CustomEvent('leaderboardUpdate'));
    
    console.log('Level and XP reset successfully');
    return true;
  } catch (error) {
    console.error('Error resetting level and XP:', error);
    return false;
  }
};

export const getCurrentStreak = () => {
  try {
    // Same logic as Dashboard uses
    const savedStats = JSON.parse(localStorage.getItem('pomoStats') || '{}');
    
    if (!savedStats || Object.keys(savedStats).length === 0) {
      return 0;
    }

    const today = new Date().toLocaleDateString('en-CA');
    let streak = 0;
    let currentDate = new Date();

    // Check each day going backwards from today
    while (true) {
      const dateKey = currentDate.toLocaleDateString('en-CA');
      const dayStats = savedStats[dateKey];

      if (!dayStats) {
        // No data for this day - break the streak unless it's today
        if (dateKey !== today) {
          break;
        }
      } else {
        // Check if this day had successful XP gains
        const hasSuccessfulXP = (dayStats.growthXP > 0) || (dayStats.harvestXP > 0);
        const hasOnlyWithering = (dayStats.witherCount > 0) && !hasSuccessfulXP;

        if (hasSuccessfulXP) {
          // Day had successful XP gains - continue streak
          streak++;
        } else if (hasOnlyWithering) {
          // Day had only withering penalties - break streak unless it's today
          if (dateKey !== today) {
            break;
          }
        } else if (dayStats.completed === 0 && dayStats.failed === 0) {
          // No activity on this day - break streak unless it's today
          if (dateKey !== today) {
            break;
          }
        }
      }

      // Move to previous day
      currentDate.setDate(currentDate.getDate() - 1);
      
      // Safety check to prevent infinite loop (max 365 days)
      if (streak > 365) {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Error calculating current streak:', error);
    return 0;
  }
};

export const getTodaysFocusTime = () => {
  try {
    const savedStats = JSON.parse(localStorage.getItem('pomoStats') || '{}');
    const today = new Date().toLocaleDateString('en-CA');
    
    console.log('=== TODAY FOCUS TIME DEBUG ===');
    console.log('Today date:', today);
    console.log('All saved stats:', savedStats);
    console.log('Today stats:', savedStats[today]);
    
    const todayStats = savedStats[today] || {
      totalFocusTime: 0
    };

    console.log('Today\'s totalFocusTime from localStorage:', todayStats.totalFocusTime);
    console.log('=== END DEBUG ===');

    return todayStats.totalFocusTime || 0;
  } catch (error) {
    console.error('Error getting today\'s focus time:', error);
    return 0;
  }
};

export const recordHarvestFromFocus = (plantType, isSuccessful, focusTime) => {
  const status = isSuccessful ? 'harvested' : 'wilted';
  return addHarvestEntry(plantType, status, focusTime);
};

export const getPlantEmoji = (plantType) => {
  const emojis = {
    carrot: '🥕',
    tomato: '🍅',
    wheat: '🌾'
  };
  return emojis[plantType] || '🌱';
};

export const formatTimeForDisplay = (seconds) => {
  if (!seconds || seconds < 60) return '0m';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};