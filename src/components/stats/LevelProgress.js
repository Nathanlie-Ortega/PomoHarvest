// src/components/stats/LevelProgress.js
import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';

const LevelProgress = ({ level, experience }) => {
  // Calculate experience needed for next level
  const nextLevelExp = level * 100; // Simple formula: level * 100
  
  // Calculate progress percentage
  const progress = Math.min(100, Math.floor((experience / nextLevelExp) * 100));
  
  // Calculate experience needed for next level
  const expNeeded = nextLevelExp - experience;
  
  return (
    <Card title={`Level ${level}`} padding="normal">
      <div className="text-center mb-4">
        <motion.div
          className="inline-block text-4xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {level < 5 ? '🌱' : level < 10 ? '🌿' : level < 15 ? '🌳' : '🌲'}
        </motion.div>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {expNeeded > 0 ? (
            <span>{expNeeded} XP needed for next level</span>
          ) : (
            <span>Ready to level up!</span>
          )}
        </p>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            Level {level}
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            Level {level + 1}
          </span>
        </div>
        
        <div className="relative pt-1">
          <div className="overflow-hidden h-4 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700">
            <motion.div
              className="flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
              style={{ width: `${progress}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1 }}
            >
              <span className="text-xs">{progress}%</span>
            </motion.div>
          </div>
        </div>
        
        <div className="flex justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400">
            {experience} XP
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            {nextLevelExp} XP
          </span>
        </div>
      </div>
      
      <div className="mt-6 space-y-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Level Benefits</h4>
        <ul className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
          <li className="flex items-center">
            <span className="mr-2">🎯</span>
            <span>Unlock new plant types</span>
          </li>
          <li className="flex items-center">
            <span className="mr-2">🏆</span>
            <span>Earn special achievements</span>
          </li>
          <li className="flex items-center">
            <span className="mr-2">🎨</span>
            <span>Customize your garden</span>
          </li>
          <li className="flex items-center">
            <span className="mr-2">🌟</span>
            <span>Higher ranking on leaderboards</span>
          </li>
        </ul>
      </div>
    </Card>
  );
};

export default LevelProgress;