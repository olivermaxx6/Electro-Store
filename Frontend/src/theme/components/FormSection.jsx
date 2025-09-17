import React from 'react';
import { themeConfig } from '../themeConfig';

export default function FormSection({ 
  title, 
  icon, 
  color = 'primary',
  background = 'card',
  children, 
  className = '',
  padding = 'p-6'
}) {
  const colorConfig = themeConfig.colors[color] || themeConfig.colors.primary;
  const iconClasses = `w-8 h-8 bg-gradient-to-r ${colorConfig.light} ${themeConfig.radius.icon} flex items-center justify-center`;
  
  return (
    <div className={`
      ${themeConfig.radius.card} 
      ${themeConfig.borders[background]} 
      ${themeConfig.backgrounds[background]} 
      ${padding} 
      ${className}
    `}>
      <div className="flex items-center gap-3 mb-6">
        <div className={iconClasses}>
          <span className="text-white text-sm">{icon}</span>
        </div>
        <h3 className={`text-xl font-bold ${themeConfig.text.primary}`}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}
