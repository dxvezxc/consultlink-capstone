import React from 'react';
import './LoadingSpinner.css'; // Create this CSS file

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-8 h-8 border-2',
    medium: 'w-12 h-12 border-3',
    large: 'w-16 h-16 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`relative ${sizeClasses[size]}`}>
        <div className="absolute inset-0 rounded-full border-t-transparent border-solid animate-spin"
             style={{ borderColor: '#3b82f6' }}></div>
        <div className="absolute inset-0 rounded-full border-r-transparent border-solid animate-spin-reverse"
             style={{ borderColor: '#10b981', animationDelay: '-0.5s' }}></div>
      </div>
      {text && (
        <p className="mt-4 text-gray-600 font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;