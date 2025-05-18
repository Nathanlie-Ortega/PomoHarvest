import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

const ProfileSettings = () => {
  const { currentUser, getUserData } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
    }
  }, [currentUser]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    try {
      setMessage('');
      setError('');
      setLoading(true);
      
      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName
      });
      
      // Update Firestore document
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName
      });
      
      setMessage('Profile updated successfully');
    } catch (error) {
      setError('Failed to update profile');
      console.error('Profile update error:', error);
    }
    
    setLoading(false);
  };
  
  return (
    <div>
      <h3 className="text-xl font-display font-bold mb-4">Profile Settings</h3>
      
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
          <label htmlFor="displayName" className="label">Display Name</label>
          <input
            id="displayName"
            type="text"
            className="input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            type="email"
            className="input bg-gray-100 dark:bg-gray-700"
            value={currentUser?.email || ''}
            disabled
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Email cannot be changed
          </p>
        </div>
        
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;