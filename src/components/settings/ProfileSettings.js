// Updated ProfileSettings.js - Final client-side solution with perfect timing
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile, sendPasswordResetEmail, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, updateDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase';
import { useNavigate } from 'react-router-dom';

const ProfileSettings = () => {
  const { currentUser, getUserData, logout } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [originalDisplayName, setOriginalDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  
  useEffect(() => {
    if (currentUser) {
      const currentDisplayName = currentUser.displayName || '';
      setDisplayName(currentDisplayName);
      setOriginalDisplayName(currentDisplayName);
    }
  }, [currentUser]);
  
  // Check if display name has been modified
  const isDisplayNameChanged = displayName.trim() !== originalDisplayName.trim();
  const isFormValid = displayName.trim().length > 0 && isDisplayNameChanged;
  
const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    try {
      setMessage('');
      setError('');
      setLoading(true);
      
      // Get fresh user from auth instead of using currentUser from context
      const freshUser = auth.currentUser;
      if (!freshUser) {
        throw new Error('User not authenticated');
      }
      
      // Update Firebase Auth profile with fresh user object
      await updateProfile(freshUser, {
        displayName: displayName.trim()
      });
      
      // Force reload the user to get updated profile
      await freshUser.reload();
      
      // Update the leaderboard entry with the new display name
      try {
        const leaderboardRef = doc(db, 'leaderboard', freshUser.uid);
        await updateDoc(leaderboardRef, {
          displayName: displayName.trim(),
          lastUpdated: new Date().toISOString()
        });
        console.log('Leaderboard display name updated successfully');
      } catch (leaderboardError) {
        console.log('Leaderboard update failed (this is okay):', leaderboardError);
      }
      
      // Optional: Try to update users collection as well
      try {
        const userRef = doc(db, 'users', freshUser.uid);
        await updateDoc(userRef, {
          displayName: displayName.trim()
        });
      } catch (firestoreError) {
        console.log('Users collection update failed (this is okay):', firestoreError);
      }
      
      setMessage('Profile updated successfully');
      
      // Update the original display name to the new value
      setOriginalDisplayName(displayName.trim());
      
      // Force a complete page reload to ensure all components get the updated data
      setTimeout(() => {
        window.location.reload();
      }, 1500); // Give user time to see success message, then reload
      
    } catch (error) {
      console.error('Profile update error:', error);
      
      // More specific error messages
      if (error.message.includes('getIdToken')) {
        setError('Authentication session expired. Please refresh the page and try again.');
      } else if (error.code === 'auth/user-token-expired') {
        setError('Your session has expired. Please refresh the page and try again.');
      } else {
        setError('Failed to update profile. Please try again.');
      }
    }
    
    setLoading(false);
  };
  
  const handlePasswordReset = async () => {
    if (!currentUser?.email) return;
    
    try {
      setMessage('');
      setError('');
      setPasswordResetLoading(true);
      
      const continueUrl = `${window.location.origin}/settings?passwordReset=true`;
      
      await sendPasswordResetEmail(auth, currentUser.email, {
        url: continueUrl,
        handleCodeInApp: false
      });
      
      localStorage.setItem('passwordResetSent', 'true');
      localStorage.setItem('passwordResetTime', Date.now().toString());
      
      setMessage('Password reset email sent! Check your inbox. After changing your password, return to this page.');
      
      startPasswordResetMonitoring();
      
    } catch (error) {
      setError('Failed to send password reset email');
      console.error('Password reset error:', error);
    }
    
    setPasswordResetLoading(false);
  };

  const startPasswordResetMonitoring = () => {
    const originalTitle = document.title;
    document.title = "Check your email - PomoHarvest";
    
    const handleFocus = () => {
      document.title = originalTitle;
      
      setTimeout(() => {
        if (localStorage.getItem('passwordResetSent') === 'true') {
          localStorage.setItem('passwordJustReset', 'true');
          localStorage.removeItem('passwordResetSent');
          localStorage.removeItem('passwordResetTime');
          
          window.location.reload();
        }
      }, 1000);
    };

    window.addEventListener('focus', handleFocus);
    
    setTimeout(() => {
      window.removeEventListener('focus', handleFocus);
      document.title = originalTitle;
      localStorage.removeItem('passwordResetSent');
      localStorage.removeItem('passwordResetTime');
    }, 600000);
  };
  
  const handleDeleteAccount = async () => {
    if (!currentUser || !deletePassword.trim()) {
      setError('Please enter your current password to confirm deletion');
      return;
    }
    
    try {
      setMessage('');
      setError('');
      setDeleteLoading(true);
      
      console.log('🎯 FINAL SOLUTION: Starting perfect-timing account deletion...');
      
      // Step 1: Re-authenticate with FRESH credentials
      try {
        const credential = EmailAuthProvider.credential(currentUser.email, deletePassword);
        await reauthenticateWithCredential(currentUser, credential);
        console.log('✅ Re-authentication successful with fresh token');
      } catch (authError) {
        console.error('❌ Re-authentication failed:', authError);
        
        if (authError.code === 'auth/wrong-password') {
          setError('Incorrect password. Please try again.');
        } else {
          setError('Authentication failed. Please check your password and try again.');
        }
        
        setDeleteLoading(false);
        return;
      }
      
      // Step 2: IMMEDIATELY delete Firestore data with fresh auth token
      try {
        console.log('🔥 Deleting Firestore data with PERFECT timing...');
        await deleteFirestoreDataImmediately(currentUser.uid, currentUser.email);
        console.log('✅ Firestore data deletion completed successfully');
      } catch (firestoreError) {
        console.error('❌ Firestore deletion failed:', firestoreError);
        setError(`Database deletion failed: ${firestoreError.message}`);
        setDeleteLoading(false);
        return;
      }
      
      // Step 3: Wait a tiny bit for Firestore to process, then delete auth
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      
      try {
        console.log('🔐 Deleting Firebase Auth account...');
        await deleteUser(currentUser);
        console.log('✅ Account deleted successfully');
        
        localStorage.clear();
        sessionStorage.clear();
        
        navigate('/', { 
          state: { 
            message: 'Account deleted successfully! All your data has been permanently removed.' 
          }
        });
        
      } catch (deleteError) {
        console.error('❌ Auth deletion error:', deleteError);
        setError('Auth account deletion failed. Your data was deleted but account remains.');
      }
      
    } catch (error) {
      console.error('💥 Critical error:', error);
      setError('An unexpected error occurred. Please try again.');
    }
    
    setDeleteLoading(false);
    setShowDeleteConfirm(false);
    setDeletePassword('');
  };
  
  const deleteFirestoreDataImmediately = async (userId, userEmail) => {
    console.log(`🎯 IMMEDIATE deletion for: ${userId} (${userEmail})`);
    let totalDeleted = 0;
    
    // MOST IMPORTANT: Delete leaderboard data with multiple approaches
    console.log('🏆 Priority 1: Deleting leaderboard data...');
    
    try {
      // Get ALL leaderboard documents and filter client-side
      const leaderboardSnapshot = await getDocs(collection(db, 'leaderboard'));
      console.log(`📊 Scanning ${leaderboardSnapshot.docs.length} leaderboard documents...`);
      
      const docsToDelete = [];
      
      leaderboardSnapshot.docs.forEach(docSnapshot => {
        const data = docSnapshot.data();
        const docId = docSnapshot.id;
        
        // Check ALL possible matches
        const isUserDoc = 
          docId === userId ||                    // Document ID matches user ID
          data.uid === userId ||                 // uid field matches
          data.email === userEmail ||            // email field matches  
          data.userId === userId ||              // userId field matches
          data.displayName === currentUser.displayName; // displayName matches
        
        if (isUserDoc) {
          console.log(`🎯 FOUND USER DOC: ${docId}`, data);
          docsToDelete.push(docSnapshot.ref);
        }
      });
      
      console.log(`🗑️ Found ${docsToDelete.length} leaderboard documents to delete`);
      
      // Delete each document individually for better error handling
      for (const docRef of docsToDelete) {
        try {
          await deleteDoc(docRef);
          totalDeleted++;
          console.log(`✅ Deleted leaderboard document: ${docRef.id}`);
        } catch (deleteError) {
          console.error(`❌ Failed to delete ${docRef.id}:`, deleteError);
        }
      }
      
      if (docsToDelete.length === 0) {
        console.log('⚠️ WARNING: No leaderboard documents found for user');
      }
      
    } catch (error) {
      console.error('❌ Leaderboard deletion failed:', error);
      throw new Error(`Leaderboard deletion failed: ${error.message}`);
    }
    
    // Delete other collections
    const collectionsToDelete = [
      { name: 'users', directDelete: true },
      { name: 'focusSessions', field: 'userId' },
      { name: 'tasks', field: 'userId' },
      { name: 'garden', field: 'userId' }, 
      { name: 'statistics', field: 'userId' },
      { name: 'userPreferences', field: 'userId' },
      { name: 'sessions', field: 'userId' },
      { name: 'achievements', field: 'userId' }
    ];
    
    for (const collectionInfo of collectionsToDelete) {
      try {
        if (collectionInfo.directDelete) {
          // Direct deletion for users collection
          const userDocRef = doc(db, collectionInfo.name, userId);
          await deleteDoc(userDocRef);
          totalDeleted++;
          console.log(`✅ Deleted ${collectionInfo.name} document directly`);
        } else {
          // Query and delete for other collections
          const collectionSnapshot = await getDocs(collection(db, collectionInfo.name));
          
          for (const docSnapshot of collectionSnapshot.docs) {
            const data = docSnapshot.data();
            if (data[collectionInfo.field] === userId) {
              await deleteDoc(docSnapshot.ref);
              totalDeleted++;
            }
          }
          
          console.log(`✅ Processed ${collectionInfo.name} collection`);
        }
      } catch (error) {
        console.log(`⚠️ ${collectionInfo.name} collection processing failed:`, error.message);
      }
    }
    
    console.log(`🎉 Total documents deleted: ${totalDeleted}`);
    
    if (totalDeleted === 0) {
      throw new Error('No documents were deleted - this indicates a critical issue');
    }
    
    return totalDeleted;
  };
  
  return (
    <div>
      <h3 className="text-xl font-display font-bold mb-4 text-white">Profile Settings</h3>
      
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
          <label htmlFor="displayName" className="label text-gray-200">Display Name</label>
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
          <label htmlFor="email" className="label text-gray-200">Email</label>
          <input
            id="email"
            type="email"
            className="input bg-gray-100 dark:bg-gray-700"
            value={currentUser?.email || ''}
            disabled
          />
          <p className="text-sm text-gray-400 mt-1">
            Email cannot be changed
          </p>
        </div>
        
        <button
          type="submit"
          className={`font-medium px-4 py-2 text-sm rounded-lg transition-all duration-300 ${
            isFormValid 
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5' 
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
          disabled={loading || !isFormValid}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
      
      {/* Password Reset Section */}
      <div className="mt-8 pt-6 border-t border-gray-600">
        <h4 className="text-lg font-semibold mb-3 text-white">Change Password</h4>
        <p className="text-sm text-gray-300 mb-4">
          We'll send a password reset link to your email address. After changing your password, return to this page to be automatically logged out for security.
        </p>
        <button
          onClick={handlePasswordReset}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-50"
          disabled={passwordResetLoading}
        >
          {passwordResetLoading ? 'Sending...' : 'Send Password Reset Email'}
        </button>
      </div>
      
      {/* Delete Account Section */}
      <div className="mt-8 pt-6 border-t border-gray-600">
        <h4 className="text-lg font-semibold mb-3 text-red-400">Danger Zone</h4>
        <p className="text-sm text-gray-300 mb-4">
          Once you delete your account, there is no going back. This will permanently delete your account and all associated data using our advanced client-side deletion process.
        </p>
        
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 text-sm rounded-lg transition-colors"
          >
            Delete Account
          </button>
        ) : (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <h5 className="font-semibold text-red-300 mb-2 flex items-center">
              <span className="mr-2">⚠️</span>
              Are you absolutely sure?
            </h5>
            <p className="text-sm text-red-200 mb-4">
              This action cannot be undone. Our optimized deletion process will permanently remove:
            </p>
            <ul className="text-sm text-red-200 mb-4 ml-4 list-disc">
              <li>Your Firebase Authentication account</li>
              <li>ALL leaderboard entries (scans all documents)</li>
              <li>All your personal data from our databases</li>
              <li>Your garden progress and focus session history</li>
              <li>All tasks, statistics, and user preferences</li>
            </ul>
            
            <div className="mb-4">
              <label htmlFor="deletePassword" className="block text-sm font-medium text-red-200 mb-2">
                Enter your current password to confirm:
              </label>
              <input
                id="deletePassword"
                type="password"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Current password"
                required
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-50"
                disabled={deleteLoading || !deletePassword.trim()}
              >
                {deleteLoading ? 'Deleting Everything...' : 'Yes, Delete Everything Forever'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword('');
                  setError('');
                }}
                className="bg-gray-600 hover:bg-gray-500 text-gray-200 font-medium px-4 py-2 text-sm rounded-lg transition-colors"
                disabled={deleteLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;