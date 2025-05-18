import React, { useState } from 'react';
import PlantDetails from './PlantDetails';

const GardenPlot = ({ plant }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const plantTypes = {
    carrot: {
      name: 'Carrot',
      emoji: '🥕',
      image: '/assets/images/plants/carrot.svg'
    },
    tomato: {
      name: 'Tomato',
      emoji: '🍅',
      image: '/assets/images/plants/tomato.svg'
    },
    wheat: {
      name: 'Wheat',
      emoji: '🌾',
      image: '/assets/images/plants/wheat.svg'
    },
    corn: {
      name: 'Corn',
      emoji: '🌽',
      image: '/assets/images/plants/corn.svg'
    }
  };
  
  const plantInfo = plantTypes[plant.type] || plantTypes.carrot;
  
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="card overflow-hidden">
      <div 
        className="relative h-48 bg-soil-100 dark:bg-soil-300 cursor-pointer"
        onClick={() => setShowDetails(true)}
      >
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-soil-300 dark:bg-soil-500" />
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={plantInfo.image}
            alt={plantInfo.name}
            className="h-32 transform transition-transform hover:scale-105"
          />
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-display font-medium">
            {plantInfo.emoji} {plantInfo.name}
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Grown on {formatDate(plant.completedAt)}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {plant.pomodoros} pomodoro{plant.pomodoros !== 1 ? 's' : ''} completed
        </p>
        
        <button
          onClick={() => setShowDetails(true)}
          className="btn-outline text-sm w-full"
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