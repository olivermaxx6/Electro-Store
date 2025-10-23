import React from 'react';
import { ThemeAlert } from '@theme';

// Simple offline handler component
export const OfflineHandler = ({ isOnline, children }) => {
  if (!isOnline) {
    return (
      <div className="p-4">
        <ThemeAlert type="warning" className="mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg">⚠️</span>
            <div>
              <h3 className="font-semibold">Backend Server Offline</h3>
              <p className="text-sm">
                The backend server is not running. Please start the Django server:
              </p>
              <code className="block mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                cd Backend && python manage.py runserver 127.0.0.1:8001
              </code>
            </div>
          </div>
        </ThemeAlert>
        {children}
      </div>
    );
  }

  return children;
};

// Hook to detect if backend is online
export const useBackendStatus = () => {
  const [isOnline, setIsOnline] = React.useState(true);
  const [lastCheck, setLastCheck] = React.useState(Date.now());

  React.useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('/api/admin/health/ping/', {
          method: 'GET',
          timeout: 3000
        });
        setIsOnline(response.ok);
        setLastCheck(Date.now());
      } catch (error) {
        setIsOnline(false);
        setLastCheck(Date.now());
      }
    };

    // Check immediately
    checkBackend();

    // Check every 10 seconds
    const interval = setInterval(checkBackend, 10000);

    return () => clearInterval(interval);
  }, []);

  return { isOnline, lastCheck };
};
