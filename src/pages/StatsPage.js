import React from 'react';
import Layout from '../components/layout/Layout';
import Stats from '../components/stats/Stats';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const StatsPage = () => {
  const { currentUser } = useAuth();
  
  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return (
    <Layout>
      <div className="py-6">
        <h1 className="text-3xl font-display font-bold mb-6">Your Stats</h1>
        <Stats />
      </div>
    </Layout>
  );
};

export default StatsPage;