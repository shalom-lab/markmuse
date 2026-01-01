import React, { useEffect } from 'react';

interface Props {
  message: string;
  type?: 'info' | 'error' | 'success';
  isOpen: boolean;
  onClose: () => void;
}

export const Toast: React.FC<Props> = ({ 
  message, 
  type = 'info', 
  isOpen, 
  onClose 
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div 
        className={`px-4 py-2 rounded shadow-lg text-sm flex items-center gap-2 ${
          type === 'error' 
            ? 'bg-red-50 text-red-500 border border-red-100' 
            : type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-gray-50 text-gray-600 border border-gray-100'
        }`}
      >
        {type === 'success' && (
          <svg 
            className="w-5 h-5 text-green-500 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={3} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        )}
        {message}
      </div>
    </div>
  );
}; 