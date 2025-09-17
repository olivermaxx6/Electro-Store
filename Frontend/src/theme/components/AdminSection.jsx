import React from 'react';
import ThemeCard from './ThemeCard';
import SectionHeader from './SectionHeader';

export default function AdminSection({ 
  title, 
  icon, 
  color = 'primary', 
  subtitle,
  children, 
  className = '',
  headerClassName = ''
}) {
  return (
    <ThemeCard className={className}>
      <SectionHeader 
        title={title} 
        icon={icon} 
        color={color} 
        subtitle={subtitle}
        className={headerClassName}
      />
      {children}
    </ThemeCard>
  );
}
