import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Check your email inbox for further instructions');
    } catch (error) {
      setError('Failed to reset password. Please check your email address.');
      console.error('Password reset error:', error);
    }
    
    setLoading(false);
  };
  
  return (
    <div className="max-w-md mx-auto">
      <div className="card p-8">
        <h2 className="text-2xl font-display font-bold mb-6 text-center">Reset Password</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block sm:inline">{message}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full btn-primary py-3"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Reset Password'}
          </button>
          
          <div className="text-center text-sm">
            <Link to="/login" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;