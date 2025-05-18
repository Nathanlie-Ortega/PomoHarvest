import React from 'react';

const Loading = ({ size = 'medium', message = 'Loading...' }) => {
  let spinnerSize;
  let textSize;
  
  switch (size) {
    case 'small':
      spinnerSize = 'h-6 w-6';
      textSize = 'text-sm';
      break;
    case 'large':
      spinnerSize = 'h-12 w-12';
      textSize = 'text-lg';
      break;
    case 'medium':
    default:
      spinnerSize = 'h-8 w-8';
      textSize = 'text-base';
      break;
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className={`${spinnerSize} animate-spin rounded-full border-4 border-primary-200 dark:border-primary-800 border-t-primary-500 dark:border-t-primary-500`}></div>
      {message && <p className={`mt-4 ${textSize} text-gray-600 dark:text-gray-300`}>{message}</p>}
    </div>
  );
};

export default Loading;