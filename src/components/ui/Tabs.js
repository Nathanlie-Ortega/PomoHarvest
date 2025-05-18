// src/components/ui/Tabs.js
import React, { useState } from 'react';

const Tabs = ({ 
  tabs, 
  defaultTab = 0,
  variant = 'underline', // 'underline', 'pills', 'enclosed'
  onChange,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  const handleTabClick = (index) => {
    setActiveTab(index);
    if (onChange) {
      onChange(index);
    }
  };
  
  // Base classes
  const baseClasses = 'flex';
  
  // Variant specific classes
  const variantClasses = {
    underline: 'border-b border-gray-200 dark:border-gray-700',
    pills: 'space-x-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg',
    enclosed: 'space-x-1'
  };
  
  // Tab button classes based on variant
  const getTabButtonClasses = (index) => {
    const isActive = index === activeTab;
    
    switch (variant) {
      case 'pills':
        return `px-4 py-2 text-sm font-medium rounded-md ${
          isActive 
            ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm' 
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`;
      case 'enclosed':
        return `px-4 py-2 text-sm font-medium border-t border-l border-r rounded-t-md ${
          isActive 
            ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-primary-600 dark:text-primary-400' 
            : 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`;
      case 'underline':
      default:
        return `px-4 py-2 text-sm font-medium border-b-2 ${
          isActive 
            ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
        }`;
    }
  };
  
  return (
    <div className={className}>
      {/* Tab buttons */}
      <div className={`${baseClasses} ${variantClasses[variant]}`}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={getTabButtonClasses(index)}
            onClick={() => handleTabClick(index)}
          >
            {tab.icon && (
              <span className="mr-2">
                {tab.icon}
              </span>
            )}
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab content */}
      <div className="mt-4">
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

export default Tabs;