import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import FocusSetupModal from '../components/timer/FocusSetupModal';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [showSetupModal, setShowSetupModal] = useState(false);
  
  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return (
    <Layout>
      <div className="py-12 max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
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
        
        {/* Stats summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="card p-6">
            <h3 className="text-lg font-display font-medium mb-1 text-gray-700 dark:text-gray-300">Today's Focus</h3>
            <p className="text-3xl font-bold text-primary-500">0h 0m</p>
          </div>
          
          <div className="card p-6">
            <h3 className="text-lg font-display font-medium mb-1 text-gray-700 dark:text-gray-300">Plants Grown</h3>
            <p className="text-3xl font-bold text-primary-500">0</p>
          </div>
          
          <div className="card p-6">
            <h3 className="text-lg font-display font-medium mb-1 text-gray-700 dark:text-gray-300">Current Streak</h3>
            <p className="text-3xl font-bold text-primary-500">0 days</p>
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