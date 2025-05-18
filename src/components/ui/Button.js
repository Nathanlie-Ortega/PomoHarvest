// src/components/ui/Button.js
import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium', 
  fullWidth = false,
  disabled = false,
  type = 'button',
  className = '',
  icon = null,
  iconPosition = 'left'
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg focus:outline-none transition-colors';
  
  // Size classes
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-600 dark:hover:bg-primary-700 disabled:bg-primary-400 dark:disabled:bg-primary-800',
    secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white dark:bg-secondary-600 dark:hover:bg-secondary-700 disabled:bg-secondary-400 dark:disabled:bg-secondary-800',
    outline: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:text-gray-400 dark:disabled:text-gray-600',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:text-gray-400 dark:disabled:text-gray-600'
  };
  
  // Full width class
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Icon spacing
  const iconSpacing = icon ? (iconPosition === 'left' ? 'space-x-2' : 'space-x-reverse space-x-2') : '';
  
  // Combine all classes
  const buttonClasses = `
    ${baseClasses} 
    ${sizeClasses[size]} 
    ${variantClasses[variant]} 
    ${widthClass}
    ${iconSpacing}
    ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
    ${className}
  `;
  
  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && iconPosition === 'left' && <span>{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span>{icon}</span>}
    </button>
  );
};

export default Button;