import React from 'react';

const PlantDetails = ({ plant, plantInfo, onClose }) => {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    
    return `${minutes} min`;
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-display font-bold">
            {plantInfo.emoji} {plantInfo.name} Details
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6 flex justify-center">
            <img
              src={plantInfo.image}
              alt={plantInfo.name}
              className="h-40"
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Growth Stats</h4>
              <ul className="mt-2 space-y-2">
                <li className="flex justify-between">
                  <span>Pomodoros Completed</span>
                  <span className="font-medium">{plant.pomodoros}</span>
                </li>
                <li className="flex justify-between">
                  <span>Total Focus Time</span>
                  <span className="font-medium">{formatDuration(plant.focusTime)}</span>
                </li>
                <li className="flex justify-between">
                  <span>Grown On</span>
                  <span className="font-medium">{formatDate(plant.completedAt)}</span>
                </li>
              </ul>
            </div>
            
            {plant.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</h4>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{plant.notes}</p>
              </div>
            )}
            
            <div className="pt-4">
              <button
                onClick={onClose}
                className="w-full btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantDetails;