import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingState {
  isLoading: boolean;
  message: string;
  progress: number;
  showProgress: boolean;
}

interface LoadingContextType {
  loadingState: LoadingState;
  showLoading: (message?: string, showProgress?: boolean) => void;
  hideLoading: () => void;
  updateProgress: (progress: number) => void;
  updateMessage: (message: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    message: 'Loading...',
    progress: 0,
    showProgress: false,
  });

  const showLoading = (message: string = 'Loading...', showProgress: boolean = false) => {
    setLoadingState({
      isLoading: true,
      message,
      progress: 0,
      showProgress,
    });
  };

  const hideLoading = () => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
    }));
  };

  const updateProgress = (progress: number) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
    }));
  };

  const updateMessage = (message: string) => {
    setLoadingState(prev => ({
      ...prev,
      message,
    }));
  };

  const value: LoadingContextType = {
    loadingState,
    showLoading,
    hideLoading,
    updateProgress,
    updateMessage,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
