import React from 'react';
import { themeConfig } from '../themeConfig';

export default function ThemeTextarea({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  rows = 3,
  className = '', 
  color = 'primary',
  required = false,
  disabled = false,
  ...props 
}) {
  const colorConfig = themeConfig.colors[color] || themeConfig.colors.primary;
  const textareaClasses = `
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
    resize-none
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
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        disabled={disabled}
        className={textareaClasses}
        {...props}
      />
    </div>
  );
}
