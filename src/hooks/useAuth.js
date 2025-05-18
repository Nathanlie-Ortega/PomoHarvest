import { useState, useEffect, useContext, createContext } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  async function signup(email, password, displayName) {
    console.log("Signup function called with:", { email, password, displayName });
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User created:", userCredential.user);
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName
      });
      console.log("Profile updated with display name");
      
      // Create user document in Firestore
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          displayName,
          email,
          createdAt: new Date().toISOString(),
          focusTimeTotal: 0,
          pomodorosCompleted: 0,
          plants: [],
          settings: {
            pomodoroTime: 25,
            shortBreakTime: 5,
            longBreakTime: 15,
            longBreakInterval: 4,
            autoStartBreaks: false,
            autoStartPomodoros: false,
            soundEnabled: true
          }
        });
        console.log("User document created in Firestore");
      } catch (firestoreError) {
        console.error("Error creating user document:", firestoreError);
        // Continue even if Firestore document creation fails
        // The user is still authenticated, just might not have all features
      }
      
      return userCredential.user;
    } catch (error) {
      console.error("Error in signup function:", error);
      throw error;
    }
  }
  
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }
  
  function logout() {
    return signOut(auth);
  }
  
  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }
  
  async function getUserData() {
    if (!currentUser) return null;
    
    try {
      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.log("No user document found for:", currentUser.uid);
        return null;
      }
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed, user:", user);
      setCurrentUser(user);
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);
  
  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    getUserData
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}