import React, { useState } from 'react';
import CategoryDropdown from './CategoryDropdown';
import electricalLightsData from '../data/electrical-lights-categories.json';

const ElectricalLightsDropdownDemo: React.FC = () => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Enhanced Electrical & Lights Dropdown Demo
          </h1>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Features Showcase:
            </h2>
            
            <ul className="space-y-2 text-gray-600 dark:text-gray-300 mb-8">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Beautiful hover effects with smooth animations
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Vertical scroll functionality for long category lists
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Enhanced visual design with gradients and shadows
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Responsive design that works on all screen sizes
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Custom scrollbar styling for better UX
              </li>
            </ul>

            <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Try the Enhanced Dropdown:
              </h3>
              
              <div className="flex justify-center">
                <CategoryDropdown
                  category={electricalLightsData}
                  isActive={isActive}
                  className="relative px-6 py-3 text-white dark:text-white font-medium rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                />
              </div>
              
              <div className="mt-4 text-center">
                <button
                  onClick={() => setIsActive(!isActive)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Toggle Active State
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Technical Improvements:
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Hover Effects:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Scale animations on hover</li>
                  <li>• Gradient background transitions</li>
                  <li>• Sparkle effects for visual appeal</li>
                  <li>• Smooth color transitions</li>
                  <li>• Backdrop blur effects</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Scroll Features:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Custom scrollbar styling</li>
                  <li>• Maximum height constraint</li>
                  <li>• Smooth scroll behavior</li>
                  <li>• Hover effects on scrollbar</li>
                  <li>• Cross-browser compatibility</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricalLightsDropdownDemo;
