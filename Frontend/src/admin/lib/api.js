// API configuration
const API_BASE_URL = 'http://127.0.0.1:8001/api';

// Helper function to get auth token
const getAuthToken = () => {
  // Try multiple token storage locations for compatibility
  const authData = JSON.parse(localStorage.getItem('auth') || '{}');
  return authData.access || 
         localStorage.getItem('access_token') || 
         localStorage.getItem('authToken') || 
         sessionStorage.getItem('authToken');
};

// Helper function to make API requests with token refresh
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  console.log(`[API] Making request to ${endpoint} with token:`, token ? 'present' : 'missing');
  
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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      // Handle 401 errors with token refresh
      if (response.status === 401 && token) {
        try {
          const authData = JSON.parse(localStorage.getItem('auth') || '{}');
          const refreshToken = authData.refresh;
          
          if (refreshToken) {
            const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh: refreshToken })
            });
            
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              const newToken = refreshData.access;
              
              // Update stored tokens in the same format as authStore
              const updatedAuthData = {
                ...authData,
                access: newToken
              };
              localStorage.setItem('auth', JSON.stringify(updatedAuthData));
              localStorage.setItem('access_token', newToken);
              
              // Retry original request with new token
              const retryConfig = {
                ...config,
                headers: {
                  ...config.headers,
                  'Authorization': `Bearer ${newToken}`
                }
              };
              
              const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, retryConfig);
              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                return {
                  data: retryData,
                  status: retryResponse.status,
                  statusText: retryResponse.statusText,
                  headers: retryResponse.headers,
                  config: retryConfig
                };
              }
            }
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          localStorage.removeItem('auth');
          localStorage.removeItem('access_token');
          window.location.href = '/admin/sign-in';
        }
      }
      
      // Try to parse error response as JSON, fallback to text
      let errorData;
      try {
        errorData = await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, try to get text
        try {
          const errorText = await response.text();
          errorData = { detail: errorText || 'Network error' };
        } catch (textError) {
          errorData = { detail: 'Network error' };
        }
      }
      
      const error = new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      error.response = { status: response.status, data: errorData };
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
    
    // Try to parse response as JSON, handle empty responses
    let data;
    try {
      const responseText = await response.text();
      if (responseText.trim()) {
        data = JSON.parse(responseText);
      } else {
        // Empty response - return empty object for DELETE operations
        data = {};
      }
    } catch (jsonError) {
      console.error(`JSON parsing error for ${endpoint}:`, jsonError);
      // If JSON parsing fails, return empty object
      data = {};
    }
    
    // Return in axios-like format for compatibility
    return {
      data: data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      config: config
    };
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    
    // If it's a network error or fetch error, add response property
    if (!error.response) {
      error.response = { 
        status: 0, 
        data: { detail: error.message || 'Network error' }
      };
    }
    
    throw error;
  }
};

// Store Settings API
export const getStoreSettings = async () => {
  return apiRequest('/admin/store-settings/');
};

export const updateStoreSettings = async (data) => {
  return apiRequest('/admin/store-settings/', {
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
};

// Products API
export const getProducts = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/admin/products/?${queryString}` : '/admin/products/';
  return apiRequest(endpoint);
};

export const getProduct = async (id) => {
  return apiRequest(`/admin/products/${id}/`);
};

export const createProduct = async (data) => {
  return apiRequest('/admin/products/', {
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
};

export const updateProduct = async (id, data) => {
  return apiRequest(`/admin/products/${id}/`, {
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
};

export const deleteProduct = async (id) => {
  return apiRequest(`/admin/products/${id}/`, {
    method: 'DELETE',
  });
};

// Categories API
export const getCategories = async () => {
  return apiRequest('/admin/categories/');
};

export const getCategory = async (id) => {
  return apiRequest(`/admin/categories/${id}/`);
};

export const createCategory = async (data) => {
  return apiRequest('/admin/categories/', {
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
};

export const updateCategory = async (id, data) => {
  return apiRequest(`/admin/categories/${id}/`, {
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
};

export const deleteCategory = async (id) => {
  console.log(`[API] Deleting category with ID: ${id}`);
  try {
    const result = await apiRequest(`/admin/categories/${id}/`, {
      method: 'DELETE',
    });
    console.log(`[API] Category ${id} deleted successfully`);
    return result;
  } catch (error) {
    console.error(`[API] Failed to delete category ${id}:`, error);
    throw error;
  }
};

// Orders API
export const getOrders = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/admin/orders/?${queryString}` : '/admin/orders/';
  return apiRequest(endpoint);
};

export const getOrder = async (id) => {
  return apiRequest(`/admin/orders/${id}/`);
};

export const updateOrder = async (id, data) => {
  return apiRequest(`/admin/orders/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// Users API
export const getUsers = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/admin/users/?${queryString}` : '/admin/users/';
  return apiRequest(endpoint);
};

export const getUser = async (id) => {
  return apiRequest(`/admin/users/${id}/`);
};

export const updateUser = async (id, data) => {
  return apiRequest(`/admin/users/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// Services API
export const getServices = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/admin/services/?${queryString}` : '/admin/services/';
  return apiRequest(endpoint);
};

export const getService = async (id) => {
  return apiRequest(`/admin/services/${id}/`);
};

export const createService = async (data) => {
  return apiRequest('/admin/services/', {
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
};

export const updateService = async (id, data) => {
  return apiRequest(`/admin/services/${id}/`, {
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
};

export const deleteService = async (id) => {
  return apiRequest(`/admin/services/${id}/`, {
    method: 'DELETE',
  });
};

// Reviews API
export const getReviews = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/admin/reviews/?${queryString}` : '/admin/reviews/';
  return apiRequest(endpoint);
};

export const getServiceReviews = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/admin/service-reviews/?${queryString}` : '/admin/service-reviews/';
  return apiRequest(endpoint);
};

// Content API
export const getWebsiteContent = async () => {
  return apiRequest('/admin/website-content/');
};

export const updateWebsiteContent = async (data) => {
  return apiRequest('/admin/website-content/', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// Contact/Inquiries API
export const getInquiries = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/admin/service-inquiries/?${queryString}` : '/admin/service-inquiries/';
  return apiRequest(endpoint);
};

export const getInquiry = async (id) => {
  return apiRequest(`/admin/service-inquiries/${id}/`);
};

export const updateInquiry = async (id, data) => {
  return apiRequest(`/admin/service-inquiries/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// Contact management functions
export const listContacts = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/admin/contacts/?${queryString}` : '/admin/contacts/';
  return apiRequest(endpoint);
};

export const markContactAsRead = async (id) => {
  return apiRequest(`/admin/contacts/${id}/mark-read/`, {
    method: 'POST',
  });
};

export const markContactAsReplied = async (id) => {
  return apiRequest(`/admin/contacts/${id}/mark-replied/`, {
    method: 'POST',
  });
};

export const closeContact = async (id) => {
  return apiRequest(`/admin/contacts/${id}/close/`, {
    method: 'POST',
  });
};

export const deleteContact = async (id) => {
  return apiRequest(`/admin/contacts/${id}/`, {
    method: 'DELETE',
  });
};

// Service query management functions
export const listServiceQueries = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/admin/service-queries/?${queryString}` : '/admin/service-queries/';
  return apiRequest(endpoint);
};

export const markServiceQueryAsRead = async (id) => {
  return apiRequest(`/admin/service-queries/${id}/mark-read/`, {
    method: 'POST',
  });
};

export const markServiceQueryAsReplied = async (id) => {
  return apiRequest(`/admin/service-queries/${id}/mark-replied/`, {
    method: 'POST',
  });
};

export const closeServiceQuery = async (id) => {
  return apiRequest(`/admin/service-queries/${id}/close/`, {
    method: 'POST',
  });
};

export const deleteServiceQuery = async (id) => {
  return apiRequest(`/admin/service-queries/${id}/`, {
    method: 'DELETE',
  });
};

// Dashboard Statistics API
export const getDashboardStats = async () => {
  return apiRequest('/admin/dashboard/stats/');
};

// Authentication API
export const login = async (email, password) => {
  return apiRequest('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const logout = async () => {
  return apiRequest('/auth/logout/', {
    method: 'POST',
  });
};

export const getCurrentUser = async () => {
  return apiRequest('/auth/me/');
};

// Admin-specific function aliases and additional functions
export const listUsers = getUsers;
export const listOrders = getOrders;
export const listProducts = getProducts;
export const listCategories = getCategories;
export const listServices = getServices;
export const listReviews = getReviews;
export const listServiceReviews = getServiceReviews;
export const listInquiries = getInquiries;

// User management functions
export const deleteUser = async (id) => {
  return apiRequest(`/admin/users/${id}/`, {
    method: 'DELETE',
  });
};

export const suspendUser = async (id) => {
  return apiRequest(`/admin/users/${id}/suspend/`, {
    method: 'POST',
  });
};

export const unsuspendUser = async (id) => {
  return apiRequest(`/admin/users/${id}/unsuspend/`, {
    method: 'POST',
  });
};

// Order management functions
export const deleteOrder = async (id) => {
  return apiRequest(`/admin/orders/${id}/`, {
    method: 'DELETE',
  });
};

// Review management functions
export const deleteReview = async (id) => {
  return apiRequest(`/admin/reviews/${id}/`, {
    method: 'DELETE',
  });
};

export const deleteServiceReview = async (id) => {
  return apiRequest(`/admin/service-reviews/${id}/`, {
    method: 'DELETE',
  });
};

export const markServiceReviewVerified = async (id) => {
  return apiRequest(`/admin/service-reviews/${id}/mark_verified/`, {
    method: 'PATCH',
  });
};

export const markServiceReviewUnverified = async (id) => {
  return apiRequest(`/admin/service-reviews/${id}/mark_unverified/`, {
    method: 'PATCH',
  });
};

// Service category functions
export const listServiceCategories = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.parent !== undefined) {
    queryParams.append('parent', params.parent);
  }
  if (params.depth !== undefined) {
    queryParams.append('depth', params.depth);
  }
  if (params.q) {
    queryParams.append('q', params.q);
  }
  
  const url = `/admin/service-categories/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return apiRequest(url);
};

export const getServiceCategoryTree = async () => {
  return apiRequest('/admin/service-categories/tree/');
};

export const getServiceCategoryChildren = async (id) => {
  return apiRequest(`/admin/service-categories/${id}/children/`);
};

export const getServiceCategoryDescendants = async (id) => {
  return apiRequest(`/admin/service-categories/${id}/descendants/`);
};

export const createServiceCategory = async (data) => {
  // Check if data is FormData (for file uploads)
  if (data instanceof FormData) {
    return apiRequest('/admin/service-categories/', {
      method: 'POST',
      body: data,
      headers: {
        // Don't set Content-Type, let browser set it with boundary for FormData
      },
    });
  }
  
  // For regular JSON data
  return apiRequest('/admin/service-categories/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateServiceCategory = async (id, data) => {
  // Check if data is FormData (for file uploads)
  if (data instanceof FormData) {
    return apiRequest(`/admin/service-categories/${id}/`, {
      method: 'PUT',
      body: data,
      headers: {
        // Don't set Content-Type, let browser set it with boundary for FormData
      },
    });
  }
  
  // For regular JSON data
  return apiRequest(`/admin/service-categories/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteServiceCategory = async (id) => {
  return apiRequest(`/admin/service-categories/${id}/`, {
    method: 'DELETE',
  });
};

// Brand and content functions
export const listBrands = async () => {
  return apiRequest('/admin/brands/');
};

export const createBrand = async (data) => {
  return apiRequest('/admin/brands/', {
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
};

export const deleteBrand = async (id) => {
  return apiRequest(`/admin/brands/${id}/`, {
    method: 'DELETE',
  });
};

export const listTopCategories = async () => {
  return apiRequest('/admin/categories/?top=true');
};

export const updateContent = async (data) => {
  return apiRequest('/admin/website-content/', {
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
};

export const getContent = getWebsiteContent;

// Subcategories API
export const listSubcategories = async (categoryId) => {
  return apiRequest(`/admin/categories/${categoryId}/subcategories/`);
};

// Brand update function
export const updateBrand = async (id, data) => {
  return apiRequest(`/admin/brands/${id}/`, {
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
};

// Product image management functions
export const uploadProductImages = async (productId, images) => {
  const formData = new FormData();
  images.forEach((image, index) => {
    formData.append(`image_${index}`, image);
  });
  
  return apiRequest(`/admin/products/${productId}/images/`, {
    method: 'POST',
    body: formData,
  });
};

export const deleteProductImage = async (productId, imageId) => {
  return apiRequest(`/admin/products/${productId}/images/${imageId}/`, {
    method: 'DELETE',
  });
};

// Initialize token refresh (placeholder)
export const initializeTokenRefresh = () => {
  // Token refresh logic would go here
  console.log('Token refresh initialized');
};

// Export api instance for direct use
export const api = {
  request: apiRequest,
  getAuthToken,
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, data) => apiRequest(endpoint, { method: 'POST', body: data instanceof FormData ? data : JSON.stringify(data) }),
  put: (endpoint, data) => apiRequest(endpoint, { method: 'PUT', body: data instanceof FormData ? data : JSON.stringify(data) }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};

// Auth store export (placeholder - this should be imported from the actual store)
export const authStore = {
  // Mock auth store object
  getState: () => ({ isAuthenticated: false, user: null }),
  subscribe: () => () => {},
};

export default {
  // Store Settings
  getStoreSettings,
  updateStoreSettings,
  
  // Products
  getProducts,
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  
  // Categories
  getCategories,
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  
  // Orders
  getOrders,
  listOrders,
  getOrder,
  updateOrder,
  deleteOrder,
  
  // Users
  getUsers,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  suspendUser,
  unsuspendUser,
  
  // Services
  getServices,
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
  
  // Service Categories
  listServiceCategories,
  getServiceCategoryTree,
  getServiceCategoryChildren,
  getServiceCategoryDescendants,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  
  // Reviews
  getReviews,
  listReviews,
  deleteReview,
  getServiceReviews,
  listServiceReviews,
  deleteServiceReview,
  markServiceReviewVerified,
  markServiceReviewUnverified,
  
  // Brands
  listBrands,
  createBrand,
  deleteBrand,
  
  // Categories (top)
  listTopCategories,
  
  // Content
  getWebsiteContent,
  getContent,
  updateWebsiteContent,
  updateContent,
  
  // Inquiries
  getInquiries,
  listInquiries,
  getInquiry,
  updateInquiry,
  
  // Dashboard
  getDashboardStats,
  
  // Auth
  login,
  logout,
  getCurrentUser,
  
  // Utils
  initializeTokenRefresh,
  api,
};
