// src/components/garden/Leaderboard.js
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Loading from '../ui/Loading';

const Leaderboard = ({ userId, isLoading: parentIsLoading }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch top 10 users based on completed sessions
        const leaderboardQuery = query(
          collection(db, 'leaderboard'),
          orderBy('completedSessions', 'desc'),
          limit(10)
        );
        
        const leaderboardSnapshot = await getDocs(leaderboardQuery);
        let leaderboardUsers = leaderboardSnapshot.docs.map((doc, index) => ({
          id: doc.id,
          rank: index + 1,
          ...doc.data()
        }));
        
        // Check if current user is in top 10
        const isUserInTopTen = userId && leaderboardUsers.some(user => user.id === userId);
        
        // If current user isn't in top 10, fetch their data
        if (userId && !isUserInTopTen) {
          const userDoc = await getDoc(doc(db, 'leaderboard', userId));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // For simplicity, we'll assume the user is just below the top 10
            // In a real app, you would compute their exact rank
            const userRank = 11;
            setCurrentUserRank(userRank);
            
            // Add user to leaderboard with their rank
            leaderboardUsers.push({
              ...userData,
              id: userId,
              rank: userRank,
              isCurrentUser: true
            });
          }
        }
        
        // Mark current user in the list
        leaderboardUsers = leaderboardUsers.map(user => ({
          ...user,
          isCurrentUser: user.id === userId
        }));
        
        setLeaderboardData(leaderboardUsers);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [userId]);

  if (isLoading || parentIsLoading) {
    return <Loading message="Loading leaderboard..." />;
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }
  
  if (leaderboardData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No leaderboard data available yet.</p>
      </div>
    );
  }
  
  // Sort the leaderboard by rank
  const sortedLeaderboard = [...leaderboardData].sort((a, b) => a.rank - b.rank);
  
  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05
      } 
    }
  };
  
  // Item animation variants
  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Leaderboard</h3>
        <button className="text-sm px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors">
          Add Friends
        </button>
      </div>
      
      <motion.div 
        className="space-y-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {sortedLeaderboard.map((user) => (
          <motion.div 
            key={user.id}
            variants={itemVariants}
            className={`p-3 rounded-lg ${
              user.isCurrentUser
                ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-center">
              <div className="w-8 flex justify-center font-bold text-gray-500 dark:text-gray-400 mr-2">
                {user.rank <= 3 ? 
                  ['🥇', '🥈', '🥉'][user.rank - 1] : 
                  `#${user.rank}`
                }
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                user.rank === 1 ? 'bg-yellow-500' :
                user.rank === 2 ? 'bg-gray-400' :
                user.rank === 3 ? 'bg-amber-600' :
                'bg-primary-500'
              }`}>
                {user.displayName?.charAt(0) || '?'}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  {user.displayName || 'Anonymous'}
                  {user.isCurrentUser && ' (You)'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Level {user.level || 1}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900 dark:text-white">{user.completedSessions || 0}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">sessions</div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Leaderboard;