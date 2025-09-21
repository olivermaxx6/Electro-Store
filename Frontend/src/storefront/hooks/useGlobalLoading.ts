import { useLoading } from '../contexts/LoadingContext';
import { useCallback } from 'react';

interface LoadingOptions {
  message?: string;
}

export const useGlobalLoading = () => {
  const { showLoading, hideLoading } = useLoading();

  const startLoading = useCallback((message: string = 'Loading...') => {
    showLoading(message, false);
  }, [showLoading]);

  const stopLoading = useCallback(() => {
    hideLoading();
  }, [hideLoading]);

  const executeWithLoading = useCallback(async (
    asyncFunction: () => Promise<void>,
    options: LoadingOptions = {}
  ) => {
    const { message = 'Loading...' } = options;

    try {
      startLoading(message);
      await asyncFunction();
    } catch (error) {
      console.error('Error during loading operation:', error);
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    startLoading,
    stopLoading,
    executeWithLoading,
  };
};
