// src/utils/analytics.js
/**
 * Utility functions for analytics and stats tracking
 */

/**
 * Get weekly statistics for focus sessions
 * @returns {Array} Array of daily stats for the past 7 days
 */
export const getWeeklyStats = () => {
  // Get the stats from localStorage
  const stats = JSON.parse(localStorage.getItem('pomoStats') || '{}');
  
  // Create an array for the past 7 days
  const dates = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  // Map dates to stats
  return dates.map(date => {
    const dayStats = stats[date] || { completed: 0, totalFocusTime: 0 };
    
    return {
      date,
      pomodoros: dayStats.completed,
      focusMinutes: Math.round(dayStats.totalFocusTime / 60) // Convert seconds to minutes
    };
  });
};

/**
 * Get total statistics for focus sessions
 * @returns {Object} Total stats including pomodoros and focus time
 */
export const getTotalStats = () => {
  const stats = JSON.parse(localStorage.getItem('pomoStats') || '{}');
  
  // Calculate totals
  let totalPomodoros = 0;
  let totalFocusTime = 0;
  
  Object.values(stats).forEach(day => {
    totalPomodoros += day.completed || 0;
    totalFocusTime += day.totalFocusTime || 0;
  });
  
  return {
    totalPomodoros,
    totalFocusTime
  };
};

/**
 * Calculate streak length (consecutive days with completed pomodoros)
 * @returns {number} Current streak in days
 */
export const getCurrentStreak = () => {
  const stats = JSON.parse(localStorage.getItem('pomoStats') || '{}');
  const today = new Date().toISOString().split('T')[0];
  
  let streak = 0;
  let currentDate = new Date(today);
  
  // Check today first
  if (stats[today] && stats[today].completed > 0) {
    streak = 1;
  } else {
    // If nothing completed today, yesterday could still be the end of the streak
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  // Check previous days
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (stats[dateStr] && stats[dateStr].completed > 0) {
      if (streak > 0) { // Only increment if we've started a streak
        streak++;
      } else {
        streak = 1; // Start streak from yesterday if nothing done today
      }
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break; // Break the streak
    }
  }
  
  return streak;
};

export default {
  getWeeklyStats,
  getTotalStats,
  getCurrentStreak
};