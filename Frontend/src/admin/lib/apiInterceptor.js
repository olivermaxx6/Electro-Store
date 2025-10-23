// Enhanced API request interceptor with authentication handling
const API_BASE_URL = '/api';

// Helper function to get auth token - consolidated approach
const getAuthToken = () => {
  // Primary: Get token from auth store format
  const authData = JSON.parse(localStorage.getItem('auth') || '{}');
  console.log(`[GET TOKEN] Auth data:`, authData);
  if (authData.access) {
    console.log(`[GET TOKEN] Found token in auth.access`);
    return authData.access;
  }
  
  // Fallback: Direct token storage
  const directToken = localStorage.getItem('access_token');
  console.log(`[GET TOKEN] Direct token:`, directToken ? 'present' : 'missing');
  return directToken || null;
};

// Helper function to check if user is authenticated
const isUserAuthenticated = () => {
  const token = getAuthToken();
  console.log(`[AUTH CHECK] Token:`, token ? 'present' : 'missing');
  if (!token) {
    console.log(`[AUTH CHECK] No token found`);
    return false;
  }
  
  // Check if token is expired
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp <= now;
    console.log(`[AUTH CHECK] Token exp: ${payload.exp}, now: ${now}, expired: ${isExpired}`);
    return payload.exp > now;
  } catch (error) {
    console.log(`[AUTH CHECK] Token parsing error:`, error);
    return false;
  }
};

// Helper function to redirect to login
const redirectToLogin = () => {
  // Only redirect if we're not already on the sign-in page
  if (window.location.pathname !== '/sign-in') {
    window.location.href = '/sign-in';
  }
};

// Enhanced API request function with authentication handling
const apiRequest = async (endpoint, options = {}) => {
  // Check if this is a public endpoint that doesn't require authentication
  const isPublicEndpoint = endpoint.startsWith('/public/');
  
  // Check authentication before making request (skip for public endpoints)
  if (!isPublicEndpoint && !isUserAuthenticated()) {
    console.warn(`[API] Unauthenticated request to ${endpoint} - redirecting to login`);
    console.log(`[API] Auth check failed - token:`, getAuthToken() ? 'present' : 'missing');
    redirectToLogin();
    throw new Error('Authentication required');
  }

  const token = getAuthToken();
  console.log(`[API] Making request to ${endpoint} with token:`, token ? 'present' : 'missing', isPublicEndpoint ? '(public endpoint)' : '');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  // Handle FormData (for file uploads)
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type']; // Let browser set boundary
  }

  try {
    console.log(`[API] Fetching: ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    console.log(`[API] Response status: ${response.status} for ${endpoint}`);
    
    // Handle authentication errors
    if (response.status === 401) {
      console.warn(`[API] Authentication failed for ${endpoint} - redirecting to login`);
      localStorage.removeItem('auth');
      localStorage.removeItem('access_token');
      localStorage.removeItem('authToken');
      redirectToLogin();
      throw new Error('Authentication expired - please login again');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Network error' }));
      
      // Don't log business logic errors as errors - they're expected behavior
      if (response.status === 400 && errorData.detail && 
          (errorData.detail.includes('product(s) are using this category') ||
           errorData.detail.includes('order item(s) are using this product'))) {
        // This is a business logic constraint, not a technical error
        throw new Error(errorData.detail);
      }
      
      // Handle 404 errors gracefully - don't log as console errors
      if (response.status === 404) {
        // This is expected when trying to delete non-existent resources
        throw new Error(errorData.detail || 'Resource not found');
      }
      
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Handle empty responses (like DELETE requests that return 204 No Content)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return { success: true, status: response.status };
    }
    
    // Check if response has content before trying to parse JSON
    const text = await response.text();
    console.log(`[API] Response text for ${endpoint}:`, text.substring(0, 200) + (text.length > 200 ? '...' : ''));
    if (!text.trim()) {
      return { success: true, status: response.status };
    }
    
    const parsedData = JSON.parse(text);
    console.log(`[API] Parsed data for ${endpoint}:`, parsedData);
    return parsedData;
  } catch (error) {
    // Don't log business logic constraint errors as console errors
    if (error.message && error.message.includes('product(s) are using this category')) {
      // This is expected business logic, not a technical error
      throw error;
    }
    
    // Don't log 404 errors as console errors - they're expected for non-existent resources
    if (error.message && (error.message.includes('No ServiceCategory matches the given query') || 
                         error.message.includes('Resource not found'))) {
      // This is expected when trying to delete non-existent resources
      throw error;
    }
    
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

// Export the enhanced functions
export { apiRequest, getAuthToken, isUserAuthenticated };
export default apiRequest;
