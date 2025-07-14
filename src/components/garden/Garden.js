import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import GardenStats from './GardenStats';
import { getHarvestHistory } from '../../utils/harvestHistory';

const Garden = () => {
  const [plants, setPlants] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Load plants from harvest history
    const loadPlants = () => {
      const harvestHistory = getHarvestHistory();
      
      // Convert harvest history to plants format
      // Convert harvest history to plants format
      const plantsData = harvestHistory.map(entry => ({
        id: entry.id,
        type: entry.plantType,
        status: entry.status === 'harvested' ? 'success' : 'failed',
        wilted: entry.status === 'wilted' || entry.status === 'failed',
        earlyBreak: entry.status === 'wilted' || entry.status === 'failed',
        focusTime: entry.focusTime,
        completedAt: entry.date,
        pomodoros: Math.floor((entry.focusTime || 0) / 1500) // Assuming 25min pomodoros
      }));

      setPlants(plantsData);
    };

    loadPlants();

    // Listen for updates
    const handleStorageChange = () => {
      loadPlants();
    };
    
    // Listen for reset events specifically
    const handleReset = () => {
      console.log('Garden component received reset event, clearing plants');
      setPlants([]); // Immediately clear plants
      // Also reload data to make sure it's in sync
      setTimeout(() => {
        loadPlants();
      }, 100); // Small delay to ensure reset is complete
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('statsUpdated', handleStorageChange);
    window.addEventListener('gardenReset', handleReset); // NEW: Listen for reset events
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('statsUpdated', handleStorageChange);
      window.removeEventListener('gardenReset', handleReset);
    };
  }, []);

  // If no plants, show empty garden
  if (plants.length === 0) {
    return (
      <div className="space-y-8">
        {/* Empty Garden Message */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-display font-bold mb-2">Your Garden</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Start focusing to grow your first plant!
          </p>
        </div>
        
        <div className="relative bg-gradient-to-b from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-12 min-h-[300px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your garden is empty
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Complete focus sessions to start growing plants!
            </p>
          </div>
        </div>

        {/* Include GardenStats component */}
        <GardenStats />
      </div>
    );
  }
  
  // If there are plants, display them
  return (
    <div className="space-y-8">
      {/* Plant Growth Overview - First section */}
      <div className="card p-6">
        <h3 className="text-lg font-medium mb-4">Plant Growth Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plant types distribution */}
          <div>
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-3">Plant Types</h4>
            
<div className="space-y-3">

          {['carrot', 'tomato', 'wheat', 'corn'].map(type => {
            const harvestedCount = plants.filter(p => p.type === type && p.status === 'success' && !p.wilted).length;
            const wiltedCount = plants.filter(p => p.type === type && p.wilted).length;
            const totalForThisType = harvestedCount + wiltedCount; // Total attempts for this plant type
            const successPercentage = totalForThisType > 0 ? Math.round((harvestedCount / totalForThisType) * 100) : 0;
            
            const getPlantEmoji = (type) => {
              const emojiMap = {
                carrot: '🥕',
                tomato: '🍅',
                wheat: '🌾',
                corn: '🌽'
              };
              return emojiMap[type] || '🌱';
            };
            
            return (
              <div key={type}>
                <div className="flex justify-between mb-1">
                  <span className="flex items-center">
                    <span className="mr-2">{getPlantEmoji(type)}</span>
                    <span className="capitalize">{type}</span>
                  </span>
                  <span className="text-sm text-gray-500">
                    {totalForThisType} ({successPercentage}%) 
                    <span className="text-xs ml-1 text-red-600">
                      {wiltedCount > 0 ? `${wiltedCount} wilted` : ''}
                    </span>
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full"
                    style={{ width: `${successPercentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}


            </div>

          </div>
          
          {/* Success rate & focus time */}
          <div>
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-3">Growth Success</h4>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
              <div className="flex justify-between mb-1">
                <span>Success Rate</span>
                <span className="font-medium">
                  {plants.length > 0 
                    ? Math.round((plants.filter(p => p.status === 'success' && !p.wilted).length / plants.length) * 100) 
                    : 0}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ 
                    width: `${plants.length > 0 
                      ? Math.round((plants.filter(p => p.status === 'success' && !p.wilted).length / plants.length) * 100) 
                      : 0}%` 
                  }}
                ></div>
              </div>
              
              
              <div className="flex justify-between mb-1">
                <span>Total Focus Time</span>
                <span className="font-medium">
                  {Math.floor(plants.reduce((sum, p) => sum + (p.focusTime || 0), 0) / 3600)}h {Math.floor((plants.reduce((sum, p) => sum + (p.focusTime || 0), 0) % 3600) / 60)}m
                </span>
              </div>
            </div>


            
          </div>
        </div>
      </div>

      {/* Include GardenStats component */}
      <GardenStats />
    </div>
  );
};

export default Garden;