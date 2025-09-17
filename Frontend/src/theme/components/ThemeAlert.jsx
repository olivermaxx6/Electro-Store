import React from 'react';
import { themeConfig } from '../themeConfig';

export default function ThemeAlert({ 
  message, 
  type = 'info', 
  className = '' 
}) {
  const alertConfig = {
    success: {
      border: 'border-emerald-200 dark:border-emerald-800',
      background: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-300',
      icon: '✅'
    },
    error: {
      border: 'border-red-200 dark:border-red-800',
      background: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-300',
      icon: '❌'
    },
    warning: {
      border: 'border-orange-200 dark:border-orange-800',
      background: 'bg-orange-50 dark:bg-orange-900/20',
      text: 'text-orange-700 dark:text-orange-300',
      icon: '⚠️'
    },
    info: {
      border: 'border-blue-200 dark:border-blue-800',
      background: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-300',
      icon: 'ℹ️'
    }
  };

  const config = alertConfig[type];

  return (
    <div className={`
      ${themeConfig.radius.input} 
      border-2 
      ${config.border} 
      ${config.background} 
      px-4 
      py-3 
      mb-6 
      text-sm 
      font-medium 
      shadow-sm 
      ${config.text} 
      ${className}
    `}>
      <div className="flex items-center gap-2">
        <span>{config.icon}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}
