import React, { useState } from 'react';
import PlantDetails from './PlantDetails';

const GardenPlot = ({ plant }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Safety check - if plant is undefined, show a placeholder
  if (!plant) {
    return (
      <div className="card overflow-hidden bg-gray-100 dark:bg-gray-700 opacity-50">
        <div className="relative h-48 bg-soil-100 dark:bg-soil-300">
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-soil-300 dark:bg-soil-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Empty Plot</p>
          </div>
        </div>
        <div className="p-4">
          <p className="text-center text-gray-500 dark:text-gray-400">
            Complete a pomodoro to plant something here!
          </p>
        </div>
      </div>
    );
  }
  
  const plantTypes = {
    carrot: {
      name: 'Carrot',
      emoji: '🥕',
      image: '/assets/images/plants/carrot.svg',
      growthTime: '15 min (Quick Grow)'
    },
    tomato: {
      name: 'Tomato',
      emoji: '🍅',
      image: '/assets/images/plants/tomato.svg',
      growthTime: '30 min (Classic Harvest)'
    },
    wheat: {
      name: 'Wheat',
      emoji: '🌾',
      image: '/assets/images/plants/wheat.svg',
      growthTime: '25 min (Classic Harvest)'
    },
    corn: {
      name: 'Corn',
      emoji: '🌽',
      image: '/assets/images/plants/corn.svg',
      growthTime: '45+ min (Deep Root)'
    }
  };
  
  // Default to carrot if type is missing
  const plantInfo = plantTypes[plant.type || 'carrot'] || plantTypes.carrot;
  
  // Determine plant status for visual indication
  const plantStatus = plant.status || 'success';
  
  const formatDate = (timestamp) => {
    const date = new Date(timestamp || Date.now());
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display (e.g. 25m or 1h 15m)
  const formatFocusTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours === 0) {
      return `${minutes}m`;
    }
    
    return `${hours}h ${minutes}m`;
  };
  
  return (
    <div className={`card overflow-hidden ${plantStatus === 'failed' ? 'border-red-300 dark:border-red-700' : ''}`}>
      <div 
        className="relative h-48 bg-soil-100 dark:bg-soil-300 cursor-pointer"
        onClick={() => setShowDetails(true)}
      >
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-soil-300 dark:bg-soil-500" />
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={plantInfo.image}
            alt={plantInfo.name}
            className={`h-32 transform transition-transform hover:scale-105 ${
              plantStatus === 'failed' ? 'opacity-50 grayscale' : ''
            }`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/assets/images/plants/carrot.svg'; 
            }}
          />
          
          {/* Visual status indicator */}
          {plantStatus === 'failed' && (
            <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 w-8 h-8 flex items-center justify-center">
              ⚠️
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-display font-medium flex items-center">
            {plantInfo.emoji} {plantInfo.name}
            {plantStatus === 'failed' && (
              <span className="ml-2 text-xs text-red-500 border border-red-300 rounded px-1">
                {plant.wilted ? 'Wilted' : 'Early Harvest'}
              </span>
            )}
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(plant.completedAt)}
          </span>
        </div>
        
        <div className="flex justify-between mb-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {plantStatus === 'success' ? (
              <span>
                {plant.pomodoros || 1} pomodoro{(plant.pomodoros || 1) !== 1 ? 's' : ''}
              </span>
            ) : (
              <span className="text-red-500">
                {formatFocusTime(plant.focusTime)}
              </span>
            )}
          </span>
          
          <span className="text-xs text-gray-500 dark:text-gray-400 italic">
            {plantInfo.growthTime}
          </span>
        </div>
        
        <button
          onClick={() => setShowDetails(true)}
          className={`btn-outline text-sm w-full ${
            plantStatus === 'failed' ? 'border-red-300 text-red-700 dark:border-red-700 dark:text-red-400' : ''
          }`}
        >
          View Details
        </button>
      </div>
      
      {showDetails && (
        <PlantDetails
          plant={plant}
          plantInfo={plantInfo}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

export default GardenPlot;