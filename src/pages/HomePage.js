import React from 'react';
import Layout from '../components/layout/Layout';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-gray-900 dark:text-white">
            Grow Your <span className="text-primary-600 dark:text-primary-400">Productivity</span> with PomoHarvest
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Turn your focus time into a garden. Complete pomodoros, grow plants, and track your productivity journey.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 justify-center mt-8">
          <Link to="/login" className="btn-primary text-center py-3 px-8 text-lg">
            Get Started
          </Link>
          <Link to="/dashboard" className="btn-outline text-center py-3 px-8 text-lg">
            Try Demo
          </Link>
        </div>
        
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-6 text-center">
            <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-bold mb-2">Focus Timer</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Use the Pomodoro technique to stay focused and take healthy breaks.
            </p>
          </div>
          
          <div className="card p-6 text-center">
            <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-bold mb-2">Virtual Garden</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Grow your own virtual garden with each completed pomodoro.
            </p>
          </div>
          
          <div className="card p-6 text-center">
            <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-bold mb-2">Track Progress</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor your productivity with detailed statistics and insights.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;