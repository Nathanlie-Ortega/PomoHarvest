import React from 'react';
import Layout from '../components/layout/Layout';
import ForgotPassword from '../components/auth/ForgotPassword';

const ForgotPasswordPage = () => {
  return (
    <Layout>
      <div className="py-12">
        <ForgotPassword />
      </div>
    </Layout>
  );
};

export default ForgotPasswordPage;