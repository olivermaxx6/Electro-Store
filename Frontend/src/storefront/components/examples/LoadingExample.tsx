import React from 'react';
import { useGlobalLoading } from '../../hooks/useGlobalLoading';

const LoadingExample: React.FC = () => {
  const { startLoading, stopLoading, setProgress, setMessage, executeWithLoading } = useGlobalLoading();

  const handleSimpleLoading = () => {
    startLoading('Processing your request...');
    setTimeout(() => {
      stopLoading();
    }, 3000);
  };

  const handleProgressLoading = () => {
    startLoading('Processing with progress...', true);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          stopLoading();
        }, 500);
      }
    }, 200);
  };

  const handleStepLoading = async () => {
    const mockAsyncOperation = async () => {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
    };

    await executeWithLoading(mockAsyncOperation, {
      message: 'Starting operation...',
      showProgress: true,
      steps: [
        { message: 'Connecting to server...', progress: 20 },
        { message: 'Authenticating user...', progress: 40 },
        { message: 'Fetching data...', progress: 60 },
        { message: 'Processing results...', progress: 80 },
        { message: 'Finalizing...', progress: 100 },
      ],
      stepDelay: 500,
    });
  };

  const handleDynamicMessage = () => {
    startLoading('Initializing...', true);
    
    const messages = [
      'Initializing...',
      'Loading configuration...',
      'Setting up environment...',
      'Preparing interface...',
      'Almost ready...',
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < messages.length) {
        setMessage(messages[index]);
        setProgress((index + 1) * 20);
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          stopLoading();
        }, 500);
      }
    }, 800);
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Global Loading Examples
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleSimpleLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Simple Loading (3s)
        </button>
        
        <button
          onClick={handleProgressLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Progress Loading
        </button>
        
        <button
          onClick={handleStepLoading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Step-by-Step Loading
        </button>
        
        <button
          onClick={handleDynamicMessage}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Dynamic Message Loading
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 dark:bg-slate-700 rounded-lg">
        <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
          Usage Examples:
        </h3>
        <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
{`// Simple loading
const { startLoading, stopLoading } = useGlobalLoading();
startLoading('Loading...');
// ... do work
stopLoading();

// With progress
const { setProgress } = useGlobalLoading();
startLoading('Loading...', true);
setProgress(50);

// Execute with automatic loading
await executeWithLoading(async () => {
  // Your async operation
}, {
  message: 'Processing...',
  showProgress: true,
  steps: [
    { message: 'Step 1', progress: 25 },
    { message: 'Step 2', progress: 50 },
    { message: 'Step 3', progress: 75 },
    { message: 'Complete', progress: 100 }
  ]
});`}
        </pre>
      </div>
    </div>
  );
};

export default LoadingExample;
