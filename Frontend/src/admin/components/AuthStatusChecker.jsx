import React, { useState, useEffect } from 'react';
import { useAuth } from '../store/authStore';
import { testAuthentication, isUserAuthenticated, getAuthToken } from '../utils/authHelper';

const AuthStatusChecker = () => {
  const { user, token, isAuthed } = useAuth();
  const [authStatus, setAuthStatus] = useState({
    frontendAuth: false,
    backendAuth: false,
    tokenValid: false,
    userData: null,
    error: null
  });

  const checkAuthStatus = async () => {
    const frontendAuth = isAuthed();
    const tokenValid = !!getAuthToken();
    
    let backendAuth = false;
    let userData = null;
    let error = null;

    try {
      const result = await testAuthentication();
      backendAuth = result.authenticated;
      userData = result.user;
      error = result.error;
    } catch (err) {
      error = err.message;
    }

    setAuthStatus({
      frontendAuth,
      backendAuth,
      tokenValid,
      userData,
      error
    });
  };

  useEffect(() => {
    checkAuthStatus();
    const interval = setInterval(checkAuthStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [user, token]);

  const getStatusColor = (status) => {
    return status ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (status) => {
    return status ? '✅' : '❌';
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border">
      <h3 className="text-lg font-semibold mb-4">Authentication Status</h3>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span>Frontend Auth:</span>
          <span className={`font-medium ${getStatusColor(authStatus.frontendAuth)}`}>
            {getStatusIcon(authStatus.frontendAuth)} {authStatus.frontendAuth ? 'Authenticated' : 'Not Authenticated'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Token Present:</span>
          <span className={`font-medium ${getStatusColor(authStatus.tokenValid)}`}>
            {getStatusIcon(authStatus.tokenValid)} {authStatus.tokenValid ? 'Valid' : 'Missing'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Backend Auth:</span>
          <span className={`font-medium ${getStatusColor(authStatus.backendAuth)}`}>
            {getStatusIcon(authStatus.backendAuth)} {authStatus.backendAuth ? 'Valid' : 'Invalid'}
          </span>
        </div>
        
        {authStatus.userData && (
          <div className="mt-3 p-2 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">User Data:</div>
            <div className="text-sm">
              <div>Username: {authStatus.userData.username}</div>
              <div>Email: {authStatus.userData.email}</div>
              <div>Staff: {authStatus.userData.is_staff ? 'Yes' : 'No'}</div>
              <div>Superuser: {authStatus.userData.is_superuser ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}
        
        {authStatus.error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
            <div className="text-sm text-red-600">Error:</div>
            <div className="text-sm text-red-700">{authStatus.error}</div>
          </div>
        )}
        
        <button 
          onClick={checkAuthStatus}
          className="mt-3 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
};

export default AuthStatusChecker;
