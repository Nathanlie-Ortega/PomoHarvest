import React from 'react';
import Layout from '../components/layout/Layout';
import Garden from '../components/garden/Garden';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const GardenPage = () => {
  const { currentUser } = useAuth();
  
  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return (
    <Layout>
      <div className="py-6">
        <h1 className="text-3xl font-display font-bold mb-6">Your Garden</h1>
        <Garden />
      </div>
    </Layout>
  );
};

export default GardenPage;