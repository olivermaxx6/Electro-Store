import React from 'react';
import { ThemeProvider as ThemeContextProvider } from '../../lib/theme.jsx';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <ThemeContextProvider>
      {children}
    </ThemeContextProvider>
  );
};

export default ThemeProvider;
