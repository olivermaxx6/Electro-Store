import React from 'react';
import { themeConfig } from '../themeConfig';

export default function ThemeInput({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '', 
  color = 'primary',
  required = false,
  disabled = false,
  ...props 
}) {
  const colorConfig = themeConfig.colors[color] || themeConfig.colors.primary;
  const inputClasses = `
    w-full 
    ${themeConfig.borders.input} 
    ${themeConfig.radius.input} 
    ${themeConfig.spacing.input} 
    ${themeConfig.backgrounds.card} 
    ${themeConfig.text.primary} 
    ${themeConfig.text.placeholder} 
    ${colorConfig.focus} 
    ${colorConfig.ring} 
    ${themeConfig.transitions}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className={`block text-sm font-semibold ${themeConfig.text.secondary}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={inputClasses}
        {...props}
      />
    </div>
  );
}
