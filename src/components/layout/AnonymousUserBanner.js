import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AnonymousUserBanner = () => {
  const { currentUser } = useAuth();
  
  // Only show banner for anonymous users
  if (!currentUser || !currentUser.isAnonymous) {
    return null;
  }
  
  return (
    <div className="bg-blue-600 text-white px-4 py-2 text-center text-sm">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4">
        <span>
          🚀 You're using <strong>Demo Mode</strong> - your progress won't be saved permanently
        </span>
        <div className="flex gap-2">
          <Link 
            to="/login" 
            className="bg-white text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
          >
            Create Account
          </Link>
          <Link 
            to="/signup" 
            className="bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-800 transition-colors border border-blue-500"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AnonymousUserBanner;