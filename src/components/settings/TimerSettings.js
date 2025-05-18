import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const TimerSettings = () => {
  const { currentUser, getUserData } = useAuth();
  const [settings, setSettings] = useLocalStorage('timerSettings', {
    pomodoro: 25 * 60, // 25 minutes in seconds
    shortBreak: 5 * 60, // 5 minutes
    longBreak: 15 * 60, // 15 minutes
    longBreakInterval: 4 // After 4 pomodoros
  });
  
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);
  const [longBreakInterval, setLongBreakInterval] = useState(4);
  const [autoStartBreaks, setAutoStartBreaks] = useState(false);
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Initialize form with current settings
    setPomodoroMinutes(settings.pomodoro / 60);
    setShortBreakMinutes(settings.shortBreak / 60);
    setLongBreakMinutes(settings.longBreak / 60);
    setLongBreakInterval(settings.longBreakInterval);
    setAutoStartBreaks(settings.autoStartBreaks || false);
    setAutoStartPomodoros(settings.autoStartPomodoros || false);
  }, [settings]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setMessage('');
      setError('');
      setLoading(true);
      
      // Update settings in localStorage
      const newSettings = {
        pomodoro: pomodoroMinutes * 60,
        shortBreak: shortBreakMinutes * 60,
        longBreak: longBreakMinutes * 60,
        longBreakInterval,
        autoStartBreaks,
        autoStartPomodoros
      };
      
      setSettings(newSettings);
      
      // If user is logged in, also update in Firestore
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          'settings.pomodoroTime': pomodoroMinutes,
          'settings.shortBreakTime': shortBreakMinutes,
          'settings.longBreakTime': longBreakMinutes,
          'settings.longBreakInterval': longBreakInterval,
          'settings.autoStartBreaks': autoStartBreaks,
          'settings.autoStartPomodoros': autoStartPomodoros
        });
      }
      
      setMessage('Timer settings updated successfully');
    } catch (error) {
      setError('Failed to update timer settings');
      console.error('Settings update error:', error);
    }
    
    setLoading(false);
  };
  
  return (
    <div>
      <h3 className="text-xl font-display font-bold mb-4">Timer Settings</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="pomodoroMinutes" className="label">Pomodoro Length (minutes)</label>
          <input
            id="pomodoroMinutes"
            type="number"
            min="1"
            max="60"
            className="input"
            value={pomodoroMinutes}
            onChange={(e) => setPomodoroMinutes(parseInt(e.target.value))}
            required
          />
        </div>
        
        <div>
          <label htmlFor="shortBreakMinutes" className="label">Short Break Length (minutes)</label>
          <input
            id="shortBreakMinutes"
            type="number"
            min="1"
            max="30"
            className="input"
            value={shortBreakMinutes}
            onChange={(e) => setShortBreakMinutes(parseInt(e.target.value))}
            required
          />
        </div>
        
        <div>
          <label htmlFor="longBreakMinutes" className="label">Long Break Length (minutes)</label>
          <input
            id="longBreakMinutes"
            type="number"
            min="1"
            max="60"
            className="input"
            value={longBreakMinutes}
            onChange={(e) => setLongBreakMinutes(parseInt(e.target.value))}
            required
          />
        </div>
        
        <div>
          <label htmlFor="longBreakInterval" className="label">Long Break Interval (pomodoros)</label>
          <input
            id="longBreakInterval"
            type="number"
            min="1"
            max="10"
            className="input"
            value={longBreakInterval}
            onChange={(e) => setLongBreakInterval(parseInt(e.target.value))}
            required
          />
        </div>
        
        <div className="flex items-center">
          <input
            id="autoStartBreaks"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={autoStartBreaks}
            onChange={(e) => setAutoStartBreaks(e.target.checked)}
          />
          <label htmlFor="autoStartBreaks" className="ml-2 block text-sm">
            Auto-start breaks
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            id="autoStartPomodoros"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={autoStartPomodoros}
            onChange={(e) => setAutoStartPomodoros(e.target.checked)}
          />
          <label htmlFor="autoStartPomodoros" className="ml-2 block text-sm">
            Auto-start pomodoros
          </label>
        </div>
        
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default TimerSettings;