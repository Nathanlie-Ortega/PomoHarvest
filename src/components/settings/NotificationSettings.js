import React, { useState, useEffect, useContext } from 'react';
import { SoundContext } from '../../contexts/SoundContext';

const NotificationSettings = () => {
  const { soundEnabled, toggleSound } = useContext(SoundContext);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Check if browser supports notifications
    if ('Notification' in window) {
      setNotificationsSupported(true);
      
      // Check if already granted
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  }, []);
  
  const requestNotificationPermission = async () => {
    setLoading(true);
    
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        setMessage('Notifications enabled successfully');
      } else {
        setError('Notification permission denied');
        setNotificationsEnabled(false);
      }
    } catch (error) {
      setError('Error enabling notifications');
      console.error('Notification permission error:', error);
    }
    
    setLoading(false);
  };
  
  return (
    <div>
      <h3 className="text-xl font-display font-bold mb-4">Notification Settings</h3>
      
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
      
      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-2">Sound Effects</h4>
          <div className="flex items-center">
            <input
              id="soundEnabled"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={soundEnabled}
              onChange={toggleSound}
            />
            <label htmlFor="soundEnabled" className="ml-2 block text-sm">
              Enable sound effects
            </label>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Play sounds when timer starts, pauses, and completes
          </p>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Browser Notifications</h4>
          {notificationsSupported ? (
            <>
              <div className="flex items-center">
                <input
                  id="notificationsEnabled"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={notificationsEnabled}
                  onChange={() => {
                    if (!notificationsEnabled) {
                      requestNotificationPermission();
                    }
                  }}
                  disabled={loading || (!notificationsEnabled && Notification.permission === 'denied')}
                />
                <label htmlFor="notificationsEnabled" className="ml-2 block text-sm">
                  Enable browser notifications
                </label>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Receive notifications when timers complete
              </p>
              
              {Notification.permission === 'denied' && (
                <p className="text-sm text-red-500 mt-2">
                  Notifications are blocked. Please update your browser settings to enable notifications.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your browser does not support notifications
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;