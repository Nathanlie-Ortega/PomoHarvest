import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const PasswordResetDetector = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    // Check if user just returned from password reset
    const checkPasswordReset = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get('mode');
      const continueUrl = urlParams.get('continueUrl');
      
      // If user is returning from password reset
      if (mode === 'resetPassword' || localStorage.getItem('passwordJustReset') === 'true') {
        // Clean up URL parameters
        if (mode === 'resetPassword') {
          window.history.replaceState({}, document.title, window.location.pathname);
          localStorage.setItem('passwordJustReset', 'true');
        }
        
        // Start logout countdown if user is logged in
        if (currentUser) {
          setShowLogoutModal(true);
          startLogoutCountdown();
        }
      }
    };

    // Check for password reset completion message
    const checkForPasswordResetSuccess = () => {
      // Listen for messages from Firebase Auth iframe/popup
      const handleMessage = (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data && event.data.type === 'PASSWORD_RESET_SUCCESS') {
          localStorage.setItem('passwordJustReset', 'true');
          if (currentUser) {
            setShowLogoutModal(true);
            startLogoutCountdown();
          }
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    };

    const startLogoutCountdown = () => {
      let timeLeft = 4;
      setCountdown(timeLeft);
      
      const countdownInterval = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        
        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          performLogout();
        }
      }, 1000);
    };

    const performLogout = async () => {
      try {
        await logout();
        localStorage.removeItem('passwordJustReset');
        setShowLogoutModal(false);
        navigate('/login', { 
          state: { 
            message: 'Password changed successfully! You have been logged out for security.' 
          }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    };

    checkPasswordReset();
    const cleanup = checkForPasswordResetSuccess();
    
    return cleanup;
  }, [currentUser, logout, navigate]);

  // Periodically check for password reset flag
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (localStorage.getItem('passwordJustReset') === 'true' && currentUser && !showLogoutModal) {
        setShowLogoutModal(true);
        startLogoutCountdown();
      }
    }, 1000);

    const startLogoutCountdown = () => {
      let timeLeft = 4;
      setCountdown(timeLeft);
      
      const countdownInterval = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        
        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          performLogout();
        }
      }, 1000);
    };

    const performLogout = async () => {
      try {
        await logout();
        localStorage.removeItem('passwordJustReset');
        setShowLogoutModal(false);
        navigate('/login', { 
          state: { 
            message: 'Password changed successfully! You have been logged out for security.' 
          }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    };

    return () => clearInterval(checkInterval);
  }, [currentUser, logout, navigate, showLogoutModal]);

  if (!showLogoutModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 text-center">
        <div className="mb-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Password Changed Successfully!
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          For security reasons, you will be logged out in {countdown} seconds.
        </p>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${((4 - countdown) / 4) * 100}%` }}
          ></div>
        </div>

        <button
          onClick={async () => {
            try {
              await logout();
              localStorage.removeItem('passwordJustReset');
              setShowLogoutModal(false);
              navigate('/login');
            } catch (error) {
              console.error('Manual logout error:', error);
            }
          }}
          className="mt-4 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          Logout Now
        </button>
      </div>
    </div>
  );
};

export default PasswordResetDetector;