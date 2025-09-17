import React from 'react';
import { themeConfig } from '../themeConfig';

export default function ThemeCard({ 
  children, 
  className = '', 
  hover = true, 
  padding = 'default',
  background = 'card'
}) {
  const paddingClass = padding === 'default' ? themeConfig.spacing.card : padding;
  const hoverClass = hover ? themeConfig.shadows.card : '';
  
  return (
    <section className={`
      ${themeConfig.radius.card} 
      ${themeConfig.borders.card} 
      ${themeConfig.backgrounds[background]} 
      ${hoverClass} 
      ${themeConfig.transitions} 
      ${paddingClass} 
      ${className}
    `}>
      {children}
    </section>
  );
}
