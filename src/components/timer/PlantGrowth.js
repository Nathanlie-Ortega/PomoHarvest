import React from 'react';

const PlantGrowth = ({ stage, failed }) => {
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
          className={`h-full transition-all duration-1000 ease-linear ${failed ? 'bg-red-500' : 'bg-primary-500'}`}
          style={{ width: `${Math.min((stage / (stages.length - 1)) * 100, 100)}%` }}
        ></div>
      </div>
      <p className="text-sm text-center text-gray-600 dark:text-gray-400">
        {failed ? 'Wilting' : currentStage}
      </p>
    </div>
  );
};

export default PlantGrowth;