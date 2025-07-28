import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import FocusSetupModal from '../components/timer/FocusSetupModal';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [todaysFocus, setTodaysFocus] = useState({ hours: 0, minutes: 0 });
  const [currentStreak, setCurrentStreak] = useState(0);

  // Get today's date in user's timezone
  const getTodayKey = () => {
    return new Date().toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format in local timezone
  };

  // Get yesterday's date in user's timezone
  const getYesterdayKey = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toLocaleDateString('en-CA');
  };

  // Expose refresh function globally so FocusPage can call it
  useEffect(() => {
    window.refreshDashboardStats = () => {
      console.log('Dashboard refresh triggered externally');
      const savedStats = JSON.parse(localStorage.getItem('pomoStats') || '{}');
      const lastSession = JSON.parse(localStorage.getItem('lastSession') || '{}');
      const today = getTodayKey();
      
      const todayStats = savedStats[today] || {
        completed: 0,
        totalFocusTime: 0,
        failed: 0,
        growthXP: 0,
        harvestXP: 0,
        witherCount: 0
      };

      let totalFocusTimeToday = todayStats.totalFocusTime || 0;
      const lastSessionDate = lastSession.completedAt ? 
        new Date(lastSession.completedAt).toLocaleDateString('en-CA') : null;
      
      if (lastSessionDate === today && lastSession.focusTime) {
        if (totalFocusTimeToday === 0) {
          totalFocusTimeToday = lastSession.focusTime;
        }
      }

      const focusTime = formatFocusTime(totalFocusTimeToday);
      setTodaysFocus(focusTime);
      
      const streak = calculateStreak(savedStats);
      setCurrentStreak(streak);
      
      console.log('Dashboard refreshed with:', { focusTime, streak, totalFocusTimeToday });
    };

    return () => {
      delete window.refreshDashboardStats;
    };
  }, []);

  // Format focus time for display
  const formatFocusTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return { hours, minutes };
  };

  // Calculate current streak
  const calculateStreak = (stats) => {
    if (!stats || Object.keys(stats).length === 0) {
      return 0;
    }

    const today = getTodayKey();
    let streak = 0;
    let currentDate = new Date();

    // Check each day going backwards from today
    while (true) {
      const dateKey = currentDate.toLocaleDateString('en-CA');
      const dayStats = stats[dateKey];

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
  };

  // Load stats from localStorage
  useEffect(() => {
    const loadStats = () => {
      try {
        const savedStats = JSON.parse(localStorage.getItem('pomoStats') || '{}');
        const today = getTodayKey();
        
        console.log('=== DASHBOARD LOADING STATS ===');
        console.log('Loading stats for date:', today);
        console.log('All saved stats:', savedStats);
        
        // Calculate today's focus time
        const todayStats = savedStats[today] || {
          completed: 0,
          totalFocusTime: 0,
          failed: 0,
          growthXP: 0,
          harvestXP: 0,
          witherCount: 0
        };

        console.log('Today stats found:', todayStats);
        console.log('Today total focus time:', todayStats.totalFocusTime);

        // CRITICAL: Use the totalFocusTime directly from savedStats
        let totalFocusTimeToday = todayStats.totalFocusTime || 0;
        
        // Also check if there's a recent session in lastSession as backup
        const lastSession = JSON.parse(localStorage.getItem('lastSession') || '{}');
        const lastSessionDate = lastSession.completedAt ? 
          new Date(lastSession.completedAt).toLocaleDateString('en-CA') : null;
        
        console.log('Last session:', lastSession);
        console.log('Last session date:', lastSessionDate);
        console.log('Last session focus time:', lastSession.focusTime);
        
        // Always use the saved stats total, don't override with lastSession
        console.log('Using totalFocusTime from saved stats:', totalFocusTimeToday);

        // Only use lastSession as backup if no data exists at all
        if (totalFocusTimeToday === 0 && lastSessionDate === today && lastSession.focusTime) {
          totalFocusTimeToday = lastSession.focusTime;
          console.log('Using last session focus time as backup only:', lastSession.focusTime);
        }

        console.log('Final total focus time for today:', totalFocusTimeToday);

        const focusTime = formatFocusTime(totalFocusTimeToday);
        setTodaysFocus(focusTime);

        // Calculate current streak
        const streak = calculateStreak(savedStats);
        setCurrentStreak(streak);

        console.log('Dashboard stats loaded:', {
          todayStats,
          totalFocusTimeToday,
          focusTime,
          streak,
          lastSession
        });
        console.log('=== END DASHBOARD LOADING ===');

      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        setTodaysFocus({ hours: 0, minutes: 0 });
        setCurrentStreak(0);
      }
    };

    loadStats();

    // Set up interval to check for date changes and updates more frequently
    const interval = setInterval(() => {
      console.log('Dashboard auto-refresh check');
      loadStats();
    }, 5000); // Check every 5 seconds for testing

    // Listen for storage changes (when FocusPage updates stats)
    const handleStorageChange = (e) => {
      if (e.key === 'pomoStats' || e.key === 'lastSession') {
        console.log('Storage changed detected:', e.key);
        setTimeout(loadStats, 100); // Small delay to ensure data is written
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events from FocusPage
    const handleStatsUpdate = (e) => {
      console.log('Stats update event received:', e.detail);
      setTimeout(loadStats, 100);
    };

    window.addEventListener('statsUpdated', handleStatsUpdate);

    // Listen for focus event (when user goes back to dashboard)
    const handleWindowFocus = () => {
      console.log('Window focused, reloading stats');
      loadStats();
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('statsUpdated', handleStatsUpdate);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <Layout>
      <div className="py-12 max-w-4xl mx-auto">
<h1 className="text-3xl md:text-4xl font-display font-bold mb-6 text-center text-white">
  Focus Dashboard
</h1>
        
        <div className="card p-8 md:p-12 text-center">
          <div className="mb-8">
            <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-full w-28 h-28 mx-auto flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-2xl font-display font-medium mb-4 text-gray-800 dark:text-gray-200">
            Ready to grow your productivity?
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
            Start a focused work session and grow plants in your garden with each completed pomodoro.
          </p>
          
          <button
            onClick={() => setShowSetupModal(true)}
            className="btn-primary py-3 px-8 text-lg font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Start Focus
          </button>
        </div>
        
        {/* Updated Stats summary - Only Today's Focus and Current Streak */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <div className="card p-6">
            <h3 className="text-lg font-display font-medium mb-1 text-gray-700 dark:text-gray-300">Today's Focus</h3>
            <p className="text-3xl font-bold text-primary-500">
              {todaysFocus.hours > 0 ? `${todaysFocus.hours}h ` : ''}{todaysFocus.minutes}m
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {todaysFocus.hours === 0 && todaysFocus.minutes === 0 ? 'No focus time yet today' : 'Total focus time today'}
            </p>
          </div>
          
          <div className="card p-6">
            <h3 className="text-lg font-display font-medium mb-1 text-gray-700 dark:text-gray-300">Current Streak</h3>
            <p className="text-3xl font-bold text-primary-500">
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {currentStreak === 0 ? 'Start your streak today!' : 
               currentStreak === 1 ? 'Keep it going!' : 
               'Amazing consistency! '}
            </p>
          </div>


        </div>
      </div>
      
      {/* Focus Setup Modal */}
      {showSetupModal && (
        <FocusSetupModal onClose={() => setShowSetupModal(false)} />
      )}
    </Layout>
  );
};

export default DashboardPage;