// src/components/timer/PlantSelection.js
import React from 'react';
import { motion } from 'framer-motion';

const PlantSelection = ({ selectedPlant, onSelectPlant }) => {
  // Plant selection options
  const plantOptions = [
    { id: 'carrot', name: 'Carrot', emoji: '🥕', time: 25, color: '#FF9F1C' },
    { id: 'tomato', name: 'Tomato', emoji: '🍅', time: 25, color: '#E71D36' },
    { id: 'wheat', name: 'Wheat', emoji: '🌾', time: 25, color: '#F5CB5C' },
    { id: 'corn', name: 'Corn', emoji: '🌽', time: 25, color: '#FFEC5C' },
    { id: 'potato', name: 'Potato', emoji: '🥔', time: 25, color: '#A77B06' },
    { id: 'strawberry', name: 'Strawberry', emoji: '🍓', time: 25, color: '#FF2E63' },
  ];
  
  // Animation for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      } 
    }
  };
  
  // Animation for individual items
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };
  
  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">Select your crop:</h3>
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {plantOptions.map((plant) => (
          <motion.button
            key={plant.id}
            onClick={() => onSelectPlant(plant.id)}
            className={`p-3 rounded-lg border ${
              selectedPlant === plant.id 
                ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20' 
                : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            } transition-colors duration-200`}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-2">{plant.emoji}</span>
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{plant.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{plant.time} min</div>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default PlantSelection;