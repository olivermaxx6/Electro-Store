import React from 'react';
import { themeConfig } from '../themeConfig';

export default function ThemeButton({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false,
  variant = 'primary',
  size = 'default',
  icon,
  className = '',
  ...props 
}) {
  const colorConfig = themeConfig.colors[variant] || themeConfig.colors.primary;
  const sizeClass = size === 'default' ? themeConfig.spacing.button : size;
  
  const buttonClasses = `
    bg-gradient-to-r 
    ${colorConfig.light} 
    hover:shadow-xl 
    hover:scale-105 
    hover:brightness-110 
    disabled:from-gray-400 
    disabled:to-gray-500 
    disabled:hover:scale-100 
    disabled:hover:brightness-100 
    text-white 
    font-bold 
    ${themeConfig.radius.button} 
    ${themeConfig.shadows.button} 
    ${themeConfig.transitions} 
    ${sizeClass} 
    flex 
    items-center 
    gap-3 
    cursor-pointer 
    active:scale-95 
    ${className}
  `;

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClasses}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </>
      ) : (
        <>
          {icon && <span className="text-lg">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
