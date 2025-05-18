export const calculateLevel = (totalPomodoros) => {
  // Base XP needed for level 1
  const baseXP = 5;
  // XP multiplication factor per level
  const factor = 1.5;
  
  // Each pomodoro is worth 1 XP
  const totalXP = totalPomodoros;
  
  // Calculate current level
  let level = 0;
  let xpRequired = 0;
  let accumulatedXP = 0;
  
  while (accumulatedXP <= totalXP) {
    level++;
    xpRequired = Math.floor(baseXP * Math.pow(factor, level - 1));
    accumulatedXP += xpRequired;
  }
  
  // Adjust level if we went over
  if (accumulatedXP > totalXP) {
    level--;
    accumulatedXP -= xpRequired;
  }
  
  // Calculate progress to next level
  const xpForNextLevel = Math.floor(baseXP * Math.pow(factor, level));
  const currentLevelXP = totalXP - accumulatedXP;
  const progress = (currentLevelXP / xpForNextLevel) * 100;
  
  return {
    level,
    currentLevelXP,
    xpForNextLevel,
    progress,
    totalXP
  };
};