import React, { useEffect } from 'react';
import { useTheme } from '../../lib/theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  useEffect(() => {
    // Apply theme on mount based on localStorage preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    const initialTheme = savedTheme || 'dark';
    
    // Apply the theme
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(initialTheme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', initialTheme === 'dark' ? '#0f172a' : '#ffffff');
    }
  }, []);

  return <>{children}</>;
};

export default ThemeProvider;
