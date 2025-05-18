import React, { createContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Get additional user data from Firestore
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserDetails(userDoc.data());
          } else {
            console.log("No user details found in Firestore");
          }
        } catch (err) {
          console.error("Error fetching user details:", err);
        }
      } else {
        setUserDetails(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Register with email and password
  const register = async (email, password, displayName) => {
    try {
      setError('');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      await updateProfile(user, { displayName });
      
      // Create user document in Firestore
      await createUserDocument(user, { displayName });
      
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in with email and password
  const login = async (email, password) => {
    try {
      setError('');
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in with Google
  const loginWithGoogle = async () => {
    try {
      setError('');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if this is a new user (create document if needed)
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      if (!userDoc.exists()) {
        await createUserDocument(result.user);
      }
      
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError('');
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setError('');
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Create user document in Firestore
  const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      
      // Create user document
      await setDoc(userRef, {
        displayName: additionalData.displayName || user.displayName || '',
        email: user.email,
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        completedSessions: 0,
        totalFocusMinutes: 0,
        level: 1,
        experience: 0,
        settings: {
          theme: 'system',
          sound: true,
          notifications: true,
          timer: {
            focusLength: 25,
            shortBreakLength: 5,
            longBreakLength: 15,
          }
        },
        ...additionalData
      }, { merge: true });
      
      // Set initial leaderboard entry
      await setDoc(doc(db, "leaderboard", user.uid), {
        displayName: additionalData.displayName || user.displayName || '',
        level: 1,
        completedSessions: 0,
        plantCount: 0,
        lastUpdated: serverTimestamp()
      });
      
    } catch (error) {
      console.error("Error creating user document:", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userDetails,
    loading,
    error,
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};