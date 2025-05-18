import React from 'react';
import Layout from '../components/layout/Layout';
import Timer from '../components/timer/Timer';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  
  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return (
    <Layout>
      <div className="py-6">
        <h1 className="text-3xl font-display font-bold mb-6 text-center">Focus Dashboard</h1>
        <Timer />
      </div>
    </Layout>
  );
};

export default DashboardPage;