// src/components/ui/Card.js
import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  footer,
  className = '',
  padding = 'normal',
  hover = false,
  onClick
}) => {
  // Base classes
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors duration-200';
  
  // Padding classes
  const paddingClasses = {
    none: '',
    small: 'p-3',
    normal: 'p-5',
    large: 'p-6'
  };
  
  // Hover classes
  const hoverClasses = hover ? 'hover:shadow-lg transition-shadow duration-200 cursor-pointer' : '';
  
  // Combine all classes
  const cardClasses = `
    ${baseClasses} 
    ${hoverClasses}
    ${className}
  `;
  
  return (
    <div className={cardClasses} onClick={onClick}>
      {(title || subtitle) && (
        <div className={`${paddingClasses[padding]} ${padding !== 'none' ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
          {title && <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
      )}
      
      <div className={paddingClasses[padding]}>
        {children}
      </div>
      
      {footer && (
        <div className={`${paddingClasses[padding]} ${padding !== 'none' ? 'border-t border-gray-200 dark:border-gray-700' : ''} bg-gray-50 dark:bg-gray-900`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;