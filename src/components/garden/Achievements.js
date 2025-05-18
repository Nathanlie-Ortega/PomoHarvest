// src/components/garden/Achievements.js (continued)
import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Loading from '../ui/Loading';

const Achievements = ({ userId, isLoading: parentIsLoading }) => {
  const [achievements, setAchievements] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserAchievements = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Get user stats
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          setUserStats(userDoc.data());
        }
        
        // In a real app, you would fetch actual achievements from Firestore
        // For this demo, we'll create achievements based on user stats
        const userAchievements = createAchievements(userDoc.data());
        setAchievements(userAchievements);
        
      } catch (err) {
        console.error('Error fetching achievements:', err);
        setError('Failed to load achievements. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAchievements();
  }, [userId]);
  
  // Create achievements based on user stats
  const createAchievements = (stats) => {
    if (!stats) return [];
    
    const completedSessions = stats.completedSessions || 0;
    const focusMinutes = stats.totalFocusMinutes || 0;
    
    // Define achievement templates
    const achievementTemplates = [
      {
        id: 'first_harvest',
        name: 'First Harvest',
        description: 'Complete your first focus session',
        icon: '🌱',
        requirement: completedSessions >= 1,
        progress: Math.min(completedSessions, 1),
        maxProgress: 1,
        xp: 10
      },
      {
        id: 'getting_started',
        name: 'Getting Started',
        description: 'Complete 5 focus sessions',
        icon: '🌿',
        requirement: completedSessions >= 5,
        progress: Math.min(completedSessions, 5),
        maxProgress: 5,
        xp: 25
      },
      {
        id: 'consistent_farmer',
        name: 'Consistent Farmer',
        description: 'Complete 25 focus sessions',
        icon: '🧑‍🌾',
        requirement: completedSessions >= 25,
        progress: Math.min(completedSessions, 25),
        maxProgress: 25,
        xp: 50
      },
      {
        id: 'focus_master',
        name: 'Focus Master',
        description: 'Complete 100 focus sessions',
        icon: '🏆',
        requirement: completedSessions >= 100,
        progress: Math.min(completedSessions, 100),
        maxProgress: 100,
        xp: 150
      },
      {
        id: 'one_hour',
        name: 'One Hour Focus',
        description: 'Accumulate 60 minutes of focus time',
        icon: '⏱️',
        requirement: focusMinutes >= 60,
        progress: Math.min(focusMinutes, 60),
        maxProgress: 60,
        xp: 20
      },
      {
        id: 'five_hours',
        name: 'Five Hour Milestone',
        description: 'Accumulate 300 minutes of focus time',
        icon: '⏰',
        requirement: focusMinutes >= 300,
        progress: Math.min(focusMinutes, 300),
        maxProgress: 300,
        xp: 75
      },
      {
        id: 'ten_hours',
        name: 'Ten Hour Dedication',
        description: 'Accumulate 600 minutes of focus time',
        icon: '🕰️',
        requirement: focusMinutes >= 600,
        progress: Math.min(focusMinutes, 600),
        maxProgress: 600,
        xp: 150
      },
      {
        id: 'day_of_focus',
        name: 'Day of Focus',
        description: 'Accumulate 1440 minutes of focus time',
        icon: '🌞',
        requirement: focusMinutes >= 1440,
        progress: Math.min(focusMinutes, 1440),
        maxProgress: 1440,
        xp: 300
      }
    ];
    
    return achievementTemplates;
  };
  
  if (isLoading || parentIsLoading) {
    return <Loading message="Loading achievements..." />;
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      } 
    }
  };
  
  // Item animation variants
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Achievements</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {achievements.filter(a => a.requirement).length} / {achievements.length} Unlocked
        </span>
      </div>
      
      <motion.div 
        className="space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {achievements.map(achievement => (
          <motion.div 
            key={achievement.id}
            variants={itemVariants}
          >
            <Card
              className={`transition-colors ${
                achievement.requirement ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-gray-50 dark:bg-gray-900 opacity-70'
              }`}
              padding="small"
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center text-2xl ${
                  achievement.requirement ? 'bg-yellow-100 dark:bg-yellow-800' : 'bg-gray-200 dark:bg-gray-800'
                }`}>
                  {achievement.requirement ? achievement.icon : '🔒'}
                </div>
                
                <div className="ml-4 flex-1">
                  <div className="flex justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {achievement.name}
                    </h4>
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">
                      {achievement.xp} XP
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {achievement.description}
                  </p>
                  
                  {/* Progress bar */}
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                      <motion.div 
                        className={`h-1.5 rounded-full ${
                          achievement.requirement 
                            ? 'bg-yellow-500 dark:bg-yellow-600' 
                            : 'bg-gray-400 dark:bg-gray-600'
                        }`}
                        style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {achievement.progress} / {achievement.maxProgress}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.round((achievement.progress / achievement.maxProgress) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Achievements;