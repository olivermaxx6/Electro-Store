import React from 'react';
import { useTheme } from '../../lib/theme.jsx';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  size = 'sm'
}) => {
  const { isDark, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        rounded-xl border px-3 py-2 text-sm 
        hover:bg-slate-100 dark:hover:bg-slate-800 
        transition-colors
        ${sizeClasses[size]}
        ${className}
      `}
      aria-label="Toggle theme"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
};

export default ThemeToggle;
