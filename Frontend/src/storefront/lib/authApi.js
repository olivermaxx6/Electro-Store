// Authentication API utilities

const API_BASE_URL = 'http://127.0.0.1:8001/api';

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Network error' }));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Auth API Error [${endpoint}]:`, error);
    throw error;
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const response = await apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store tokens
    if (response.access) {
      localStorage.setItem('authToken', response.access);
      if (response.refresh) {
        localStorage.setItem('refreshToken', response.refresh);
      }
    }

    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await apiRequest('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Store tokens if registration includes login
    if (response.access) {
      localStorage.setItem('authToken', response.access);
      if (response.refresh) {
        localStorage.setItem('refreshToken', response.refresh);
      }
    }

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    
    // Enhanced error handling for registration
    if (error.message.includes('username already exists')) {
      throw new Error('A user with this username already exists. Please choose a different username.');
    } else if (error.message.includes('email address already exists')) {
      throw new Error('A user with this email address already exists. Please use a different email or try signing in.');
    } else if (error.message.includes('already exists')) {
      throw new Error('A user with this information already exists. Please check your details or try signing in.');
    }
    
    throw error;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      // Note: Backend doesn't have a logout endpoint, just clear tokens locally
      // await apiRequest('/logout', {
      //   method: 'POST',
      //   body: JSON.stringify({ refresh: refreshToken }),
      // });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear tokens regardless of API call success
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }
};

// Get current user
export const getCurrentUser = async () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  return apiRequest('/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Refresh token
export const refreshToken = async () => {
  const refreshTokenValue = localStorage.getItem('refreshToken');
  if (!refreshTokenValue) {
    throw new Error('No refresh token found');
  }

  try {
    const response = await apiRequest('/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshTokenValue }),
    });

    if (response.access) {
      localStorage.setItem('authToken', response.access);
      if (response.refresh) {
        localStorage.setItem('refreshToken', response.refresh);
      }
    }

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    // Clear tokens on refresh failure
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  return !!token;
};

// Get stored auth token
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export default {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  refreshToken,
  isAuthenticated,
  getAuthToken
};
