import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import GardenPlot from './GardenPlot';

const Garden = () => {
  const { currentUser } = useAuth();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load user's plants from Firestore
  useEffect(() => {
    const loadPlants = async () => {
      if (!currentUser) {
        setPlants([]);
        setLoading(false);
        return;
      }
      
      try {
        console.log("Loading plants for user:", currentUser.uid);
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userPlants = userDoc.data().plants || [];
          console.log("Retrieved plants:", userPlants);
          setPlants(userPlants);
        } else {
          console.log("No user document found");
          setPlants([]);
        }
      } catch (err) {
        console.error('Error loading plants:', err);
        setError("Failed to load plants: " + err.message);
      }
      
      setLoading(false);
    };
    
    loadPlants();
  }, [currentUser]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }
  
  // If no plants, show empty state with visual garden background
  if (!plants || plants.length === 0) {
    return (
      <div className="relative">
        {/* Visual garden background */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-b from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 p-6 h-full">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="h-24 md:h-36 bg-soil-300/20 dark:bg-soil-600/20 rounded-lg border border-soil-400/30 dark:border-soil-500/30">
                  <div className="flex items-end justify-center h-full pb-2">
                    <div className="w-8 h-8 rounded-full bg-soil-200 dark:bg-soil-700 opacity-50"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center py-12 relative z-10 bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 rounded-xl backdrop-blur-sm">
          <div className="mb-6">
            <img 
              src="/assets/images/plants/carrot.svg" 
              alt="Empty Garden" 
              className="h-24 w-24 mx-auto opacity-50"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/100?text=Plant'; 
              }}
            />
          </div>
          <h2 className="text-xl font-display font-medium mb-2">Your garden is empty</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Complete pomodoro sessions to grow plants in your garden
          </p>
          
          {/* Add a demo plant for testing */}
          <button 
            className="btn-primary mt-4"
            onClick={() => {
              // Create a demo plant for testing
              setPlants([
                {
                  type: 'carrot',
                  completedAt: new Date().toISOString(),
                  pomodoros: 1,
                  focusTime: 1500, // 25 minutes in seconds
                  notes: 'This is a demo plant to show how the garden works!'
                }
              ]);
            }}
          >
            Add Demo Plant
          </button>
        </div>
      </div>
    );
  }
  
  // If there are plants, display them in an enhanced garden view
  return (
    <div className="space-y-8">
      {/* Garden Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-display font-bold mb-2">Your Growing Garden</h2>
        <p className="text-gray-600 dark:text-gray-400">
          You've grown {plants.length} plants through your focused work!
        </p>
      </div>
      
      {/* Garden Visualization */}
      <div className="relative bg-gradient-to-b from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 min-h-[300px]">
        {/* Soil rows */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-soil-300/20 dark:bg-soil-600/30 rounded-b-xl"></div>
        
        {/* Grid of plants */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative">
          {plants.map((plant, index) => (
            <GardenPlot key={index} plant={plant} />
          ))}
        </div>
      </div>
      
      {/* Garden History */}
      <div className="card p-6">
        <h3 className="text-lg font-medium mb-4">Recent Harvests</h3>
        <div className="space-y-4">
          {plants.slice(0, 5).map((plant, index) => {
            const date = new Date(plant.completedAt);
            const formattedDate = date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
            
            // Get appropriate emoji and status for the plant
            const getPlantEmoji = (type) => {
              const emojiMap = {
                carrot: '🥕',
                tomato: '🍅',
                wheat: '🌾',
                corn: '🌽'
              };
              return emojiMap[type] || '🌱';
            };
            
            const getStatusColor = (status) => {
              return status === 'success' ? 'text-green-500' : 'text-red-500';
            };
            
            const getStatusText = (plant) => {
              if (plant.status === 'success') {
                return 'Successfully grown';
              } else if (plant.wilted) {
                return 'Wilted (excessive pauses)';
              } else if (plant.earlyBreak) {
                return 'Harvested early';
              } else {
                return 'Failed to grow';
              }
            };
            
            return (
              <div key={index} className="flex items-center border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                  plant.status === 'success' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  <span className="text-xl">{getPlantEmoji(plant.type)}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium capitalize">{plant.type}</h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{formattedDate}</span>
                  </div>
                  
                  <div className="flex justify-between mt-1">
                    <span className={getStatusColor(plant.status)}>
                      {getStatusText(plant)}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.floor(plant.focusTime / 60)}m • {plant.pomodoros || 0} pomodoro{plant.pomodoros !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Show "View all" button if there are more than 5 plants */}
        {plants.length > 5 && (
          <div className="text-center mt-4">
            <button className="btn-outline text-sm">
              View All Harvests
            </button>
          </div>
        )}
      </div>
      
      {/* Garden Statistics */}
      <div className="card p-6">
        <h3 className="text-lg font-medium mb-4">Garden Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plant types distribution */}
          <div>
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-3">Plant Types</h4>
            
            <div className="space-y-3">
              {['carrot', 'tomato', 'wheat', 'corn'].map(type => {
                const count = plants.filter(p => p.type === type).length;
                const percentage = plants.length > 0 ? Math.round((count / plants.length) * 100) : 0;
                
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
                      <span className="text-sm text-gray-500">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
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
                    ? Math.round((plants.filter(p => p.status === 'success').length / plants.length) * 100) 
                    : 0}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ 
                    width: `${plants.length > 0 
                      ? Math.round((plants.filter(p => p.status === 'success').length / plants.length) * 100) 
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
              
              <div className="flex justify-between mb-1">
                <span>Pomodoros Completed</span>
                <span className="font-medium">
                  {plants.reduce((sum, p) => sum + (p.pomodoros || 0), 0)}
                </span>
              </div>
            </div>
            
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Plant Growth System</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center">
                <span className="w-5 h-5 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mr-2">🌱</span>
                <span className="text-gray-600 dark:text-gray-400">1 Pomodoro = 1 sprout</span>
              </div>
              <div className="flex items-center">
                <span className="w-5 h-5 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mr-2">🌿</span>
                <span className="text-gray-600 dark:text-gray-400">4 Pomodoros = full plant</span>
              </div>
              <div className="flex items-center">
                <span className="w-5 h-5 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mr-2">💀</span>
                <span className="text-gray-600 dark:text-gray-400">Failed session = plant withers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Garden;