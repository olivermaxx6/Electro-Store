import React, { useEffect } from 'react';
import { themeConfig } from '../themeConfig';

export default function ThemeAlert({ 
  message, 
  type = 'info', 
  className = '',
  onClose,
  autoClose = true,
  duration = 1000
}) {
  const alertConfig = {
    success: {
      border: 'border-emerald-200 dark:border-emerald-800',
      background: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-300',
      icon: '✅',
      iconBg: 'bg-emerald-500'
    },
    error: {
      border: 'border-red-200 dark:border-red-800',
      background: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-300',
      icon: '❌',
      iconBg: 'bg-red-500'
    },
    warning: {
      border: 'border-orange-200 dark:border-orange-800',
      background: 'bg-orange-50 dark:bg-orange-900/20',
      text: 'text-orange-700 dark:text-orange-300',
      icon: '⚠️',
      iconBg: 'bg-orange-500'
    },
    info: {
      border: 'border-blue-200 dark:border-blue-800',
      background: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-300',
      icon: 'ℹ️',
      iconBg: 'bg-blue-500'
    }
  };

  const config = alertConfig[type];

  // Auto-close functionality
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose, duration]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup Dialog */}
      <div className={`
        relative 
        max-w-md 
        w-full 
        ${themeConfig.radius.input} 
        border-2 
        ${config.border} 
        ${config.background} 
        p-6 
        shadow-2xl 
        transform 
        transition-all 
        duration-300 
        ease-out
        animate-in 
        slide-in-from-bottom-4 
        fade-in
        ${className}
      `}>
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            title="Close"
          >
            <span className="text-slate-500 dark:text-slate-400 text-lg">×</span>
          </button>
        )}
        
        {/* Content */}
        <div className="flex items-start gap-4 pr-8">
          {/* Icon */}
          <div className={`
            w-12 h-12 
            ${config.iconBg} 
            rounded-full 
            flex items-center justify-center 
            flex-shrink-0
            shadow-lg
          `}>
            <span className="text-white text-xl">{config.icon}</span>
          </div>
          
          {/* Message */}
          <div className="flex-1">
            <h3 className={`
              text-lg 
              font-semibold 
              ${config.text} 
              mb-2
            `}>
              {type === 'success' && 'Success!'}
              {type === 'error' && 'Error!'}
              {type === 'warning' && 'Warning!'}
              {type === 'info' && 'Information'}
            </h3>
            <p className={`
              text-sm 
              font-medium 
              ${config.text}
              leading-relaxed
            `}>
              {message}
            </p>
          </div>
        </div>
        
        {/* Progress Bar for Auto-close */}
        {autoClose && onClose && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10 rounded-b-lg overflow-hidden">
            <div 
              className={`h-full ${config.iconBg} transition-all ease-linear animate-shrink`}
              style={{
                animationDuration: `${duration}ms`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}