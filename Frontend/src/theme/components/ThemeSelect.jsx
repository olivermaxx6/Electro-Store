import React from 'react';
import { themeConfig } from '../themeConfig';

export default function ThemeSelect({ 
  label, 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Select an option',
  className = '', 
  color = 'primary',
  disabled = false,
  ...props 
}) {
  const colorConfig = themeConfig.colors[color] || themeConfig.colors.primary;
  const selectClasses = `
    w-full 
    ${themeConfig.borders.input} 
    ${themeConfig.radius.input} 
    ${themeConfig.spacing.input} 
    ${themeConfig.backgrounds.card} 
    ${themeConfig.text.primary} 
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
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={selectClasses}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value || option.id} value={option.value || option.id}>
            {option.label || option.name}
          </option>
        ))}
      </select>
    </div>
  );
}
