import React from 'react';

const PlantGrowth = ({ stage }) => {
  const stages = [
    'Seed', 
    'Sprout', 
    'Growing', 
    'Maturing', 
    'Harvested'
  ];
  
  const currentStage = stages[Math.min(stage, stages.length - 1)];
  
  return (
    <div className="w-full space-y-2">
      <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary-500 transition-all duration-1000 ease-linear"
          style={{ width: `${Math.min((stage / (stages.length - 1)) * 100, 100)}%` }}
        ></div>
      </div>
      <p className="text-sm text-center text-gray-600 dark:text-gray-400">
        {currentStage}
      </p>
    </div>
  );
};

export default PlantGrowth;