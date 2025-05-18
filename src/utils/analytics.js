export const getWeeklyStats = () => {
  const stats = JSON.parse(localStorage.getItem('pomoStats') || '{}');
  
  // Get dates for the current week
  const today = new Date();
  const day = today.getDay();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - day);
  
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    weekDates.push(date.toISOString().split('T')[0]);
  }
  
  // Prepare data for the week
  const weeklyData = weekDates.map(date => {
    const dayStats = stats[date] || { completed: 0, totalFocusTime: 0 };
    
    return {
      date,
      pomodoros: dayStats.completed,
      focusMinutes: Math.round(dayStats.totalFocusTime / 60)
    };
  });
  
  return weeklyData;
};

export const getTotalStats = () => {
  const stats = JSON.parse(localStorage.getItem('pomoStats') || '{}');
  
  // Calculate totals
  let totalPomodoros = 0;
  let totalFocusTime = 0;
  
  Object.values(stats).forEach(dayStat => {
    totalPomodoros += dayStat.completed || 0;
    totalFocusTime += dayStat.totalFocusTime || 0;
  });
  
  // Calculate streak
  let currentStreak = 0;
  const today = new Date().toISOString().split('T')[0];
  
  let date = new Date();
  let checkDate = date.toISOString().split('T')[0];
  
  while (stats[checkDate] && stats[checkDate].completed > 0) {
    currentStreak++;
    date.setDate(date.getDate() - 1);
    checkDate = date.toISOString().split('T')[0];
  }
  
  // Calculate hours and minutes
  const totalHours = Math.floor(totalFocusTime / 3600);
  const remainingMinutes = Math.floor((totalFocusTime % 3600) / 60);
  
  return {
    totalPomodoros,
    totalFocusTime,
    totalHours,
    remainingMinutes,
    currentStreak
  };
};