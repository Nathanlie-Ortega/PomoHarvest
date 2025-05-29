import React, { useState } from 'react';

const TodoItem = ({ todo, onToggle, onDelete, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Calculate goal progress percentage based on goal hours (1-48 range)
  const calculateGoalProgress = (goalHours) => {
    if (!goalHours) return 0;
    
    // Convert goal hours (1-48) to percentage (10-100%)
    // 1 hour = 10% (minimum visible), 48 hours = 100% (maximum)
    const minPercentage = 10;
    const maxPercentage = 100;
    const minHours = 1;
    const maxHours = 48;
    
    // Calculate percentage based on goal hours
    const percentage = minPercentage + ((goalHours - minHours) / (maxHours - minHours)) * (maxPercentage - minPercentage);
    
    // Ensure it stays within bounds
    return Math.min(Math.max(percentage, minPercentage), maxPercentage);
  };
  
  return (
    <li className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
      <div className="flex items-center p-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        
        <div className="ml-3 flex-1">
          <p className={`text-gray-800 dark:text-gray-200 ${todo.completed ? 'line-through text-gray-400 dark:text-gray-600' : ''}`}>
            {todo.name}
          </p>
          
          {/* Preview of extra details */}
          {(todo.reminder || todo.goal || todo.notes) && (
            <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
              {todo.reminder && (
                <span className="flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {todo.reminder}
                </span>
              )}
              
              {todo.goal && (
                <span className="flex items-center bg-primary-100 dark:bg-primary-900/20 px-2 py-0.5 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {todo.goal}
                </span>
              )}
              
              {todo.resetGoal !== 'never' && (
                <span className="flex items-center bg-secondary-100 dark:bg-secondary-900/20 px-2 py-0.5 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  <span className="capitalize">{todo.resetGoal}</span>
                </span>
              )}
              
              {todo.habitTracking !== 'off' && (
                <span className="flex items-center bg-purple-100 dark:bg-purple-900/20 px-2 py-0.5 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span className="capitalize">{todo.habitTracking}</span>
                </span>
              )}
              
              {todo.notes && (
                <span className="flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  Notes
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-primary-500"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              {isExpanded ? (
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              )}
            </svg>
          </button>
          
          <button
            onClick={() => onEdit(todo)}
            className="text-gray-400 hover:text-blue-500"
            aria-label="Edit task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          
          <button
            onClick={() => onDelete(todo.id)}
            className="text-gray-400 hover:text-red-500"
            aria-label="Delete task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Expanded details */}
      {isExpanded && (
        <div className="p-3 pt-0 pl-11 border-t border-gray-200 dark:border-gray-700">
          {todo.notes && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes:</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                {todo.notes}
              </p>
            </div>
          )}
          
          {todo.reminder && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Reminder:</h4>
              <div className="flex items-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-600 dark:text-gray-400">{todo.reminder}</span>
              </div>
            </div>
          )}
          
          {todo.goal && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Goal:</h4>
              <div className="flex items-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-600 dark:text-gray-400">{todo.goal} Goal</span>
                
                {/* Dynamic Progress bar based on goal hours */}
                <div className="ml-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${calculateGoalProgress(todo.goalHours)}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  {todo.goalHours}h/{todo.goalHours >= 24 ? '48h' : '24h'}
                </span>
              </div>
            </div>
          )}
          
          {todo.resetGoal !== 'never' && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Reset Goal:</h4>
              <div className="flex items-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{todo.resetGoal} Reset</span>
              </div>
            </div>
          )}
          
          {todo.habitTracking !== 'off' && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Habit Tracking:</h4>
              <div className="flex items-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{todo.habitTracking} Tracking</span>
              </div>
              
              {/* Simple habit tracker UI could be added here */}
              {todo.habitTracking === 'weekly' && (
                <div className="flex space-x-1 mt-2">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <div key={i} className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs">
                      {day}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </li>
  );
};

export default TodoItem;