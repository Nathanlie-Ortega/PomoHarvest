// src/utils/levelCalculator.js
/**
 * Level calculation utilities for gamification
 */

/**
 * Calculate user level based on completed pomodoros
 * @param {number} completedPomodoros - Total number of completed pomodoros
 * @returns {Object} Level information including level, XP, and progress
 */
export const calculateLevel = (completedPomodoros) => {
  // Base XP required for level 1
  const baseXp = 5;
  
  // XP per pomodoro
  const xpPerPomodoro = 10;
  
  // Calculate total XP
  const totalXp = completedPomodoros * xpPerPomodoro;
  
  // Find the current level
  let level = 0;
  let xpForNextLevel = baseXp;
  let currentLevelXP = 0;
  
  while (currentLevelXP + xpForNextLevel <= totalXp) {
    currentLevelXP += xpForNextLevel;
    level++;
    // Increase XP required for next level (progressive difficulty)
    xpForNextLevel = Math.floor(baseXp * Math.pow(1.5, level));
  }
  
  // Calculate progress to next level
  const xpInCurrentLevel = totalXp - currentLevelXP;
  const progress = (xpInCurrentLevel / xpForNextLevel) * 100;
  
  return {
    level,
    totalXp,
    currentLevelXP: xpInCurrentLevel,
    xpForNextLevel,
    progress
  };
};

/**
 * Get rewards for a specific level
 * @param {number} level - The user's level
 * @returns {Array} List of rewards unlocked at this level
 */
export const getLevelRewards = (level) => {
  const rewards = {
    1: ['Carrot seeds unlocked'],
    2: ['Wheat seeds unlocked'],
    3: ['Tomato seeds unlocked'],
    5: ['Corn seeds unlocked'],
    7: ['Garden expansion - 2x2'],
    10: ['Garden expansion - 3x3', 'Potato seeds unlocked'],
    15: ['Garden expansion - 4x4', 'Strawberry seeds unlocked'],
    20: ['Garden expansion - 5x5', 'Stats dashboard unlocked'],
    25: ['Garden themes unlocked'],
    30: ['Achievement badges unlocked']
  };
  
  return rewards[level] || [];
};

export default {
  calculateLevel,
  getLevelRewards
};