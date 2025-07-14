import React from 'react';
import Layout from '../components/layout/Layout';
import Leaderboard from '../components/leaderboard/Leaderboard';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const LeaderboardPage = () => {
  const { currentUser } = useAuth();
  
  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return (
    <Layout>
      <div className="py-6 container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">🏆 Leaderboard</h1>
        </div>
        
        <Leaderboard />
      </div>
    </Layout>
  );
};

export default LeaderboardPage;