import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const NotFoundPage = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-24">
        <h1 className="text-6xl font-display font-bold text-primary-500 mb-4">404</h1>
        <p className="text-xl mb-8">Oops! The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary">
          Go back to home
        </Link>
      </div>
    </Layout>
  );
};

export default NotFoundPage;