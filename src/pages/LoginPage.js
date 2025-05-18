import React from 'react';
import Login from '../components/auth/Login';
import Layout from '../components/layout/Layout';

const LoginPage = () => {
  return (
    <Layout>
      <div className="py-12">
        <Login />
      </div>
    </Layout>
  );
};

export default LoginPage;