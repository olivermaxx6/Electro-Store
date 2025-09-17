import React from 'react';
import { themeConfig } from '../themeConfig';

export default function SectionHeader({ title, icon, color = 'primary', subtitle, className = '' }) {
  const colorConfig = themeConfig.colors[color] || themeConfig.colors.primary;
  const iconClasses = `w-10 h-10 bg-gradient-to-r ${colorConfig.light} ${themeConfig.radius.icon} flex items-center justify-center`;
  
  return (
    <div className={`${themeConfig.spacing.card} ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={iconClasses}>
          <span className="text-white text-lg">{icon}</span>
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${themeConfig.text.primary}`}>
            {title}
          </h2>
          {subtitle && (
            <p className={`text-sm ${themeConfig.text.muted} mt-1`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
