import React from 'react';
import { themeConfig } from '../themeConfig';

export default function ThemeLayout({ children, className = '' }) {
  return (
    <div className={`
      ${themeConfig.spacing.section} 
      p-6 
      ${themeConfig.backgrounds.main} 
      min-h-screen 
      ${className}
    `}>
      {children}
    </div>
  );
}
