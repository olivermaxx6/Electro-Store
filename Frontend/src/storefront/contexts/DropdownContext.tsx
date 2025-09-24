import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DropdownContextType {
  activeDropdown: string | null;
  setActiveDropdown: (dropdownId: string | null) => void;
  closeAllDropdowns: () => void;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

export const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('useDropdown must be used within a DropdownProvider');
  }
  return context;
};

interface DropdownProviderProps {
  children: ReactNode;
}

export const DropdownProvider: React.FC<DropdownProviderProps> = ({ children }) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const closeAllDropdowns = () => {
    setActiveDropdown(null);
  };

  return (
    <DropdownContext.Provider 
      value={{ 
        activeDropdown, 
        setActiveDropdown, 
        closeAllDropdowns 
      }}
    >
      {children}
    </DropdownContext.Provider>
  );
};
