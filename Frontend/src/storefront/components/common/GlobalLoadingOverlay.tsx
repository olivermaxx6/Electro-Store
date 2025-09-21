import React from 'react';
import { useLoading } from '../../contexts/LoadingContext';
import LoadingScreen from './LoadingScreen';

const GlobalLoadingOverlay: React.FC = () => {
  const { loadingState } = useLoading();

  if (!loadingState.isLoading) {
    return null;
  }

  return (
    <LoadingScreen
      message={loadingState.message}
      showProgress={loadingState.showProgress}
      progress={loadingState.progress}
    />
  );
};

export default GlobalLoadingOverlay;
