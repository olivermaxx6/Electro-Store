import React from 'react';
import { useTheme } from '../../lib/theme';

interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading..." 
}) => {
  const { isDark } = useTheme();

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${
      isDark 
        ? 'bg-slate-900' 
        : 'bg-white'
    }`}>
      {/* Simple Loading Circle */}
      <div className="text-center">
        {/* Loading Circle */}
        <div className="mb-4">
          <div className={`w-12 h-12 border-4 border-transparent border-t-4 rounded-full animate-spin mx-auto ${
            isDark ? 'border-t-blue-500' : 'border-t-red-500'
          }`} />
        </div>
        
        {/* Loading Message */}
        <div className={`text-sm font-medium ${
          isDark ? 'text-slate-300' : 'text-gray-600'
        }`}>
          {message}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
