// API configuration
const API_BASE_URL = 'http://127.0.0.1:8001/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
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
      const errorData = await response.json().catch(() => ({ detail: 'Network error' }));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

// Store Settings API
export const getStoreSettings = async () => {
  return apiRequest('/store-settings/');
};

export const updateStoreSettings = async (data) => {
  return apiRequest('/store-settings/', {
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
};

// Products API
export const getProducts = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/products/?${queryString}` : '/products/';
  return apiRequest(endpoint);
};

export const getProduct = async (id) => {
  return apiRequest(`/products/${id}/`);
};

export const createProduct = async (data) => {
  return apiRequest('/products/', {
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
};

export const updateProduct = async (id, data) => {
  return apiRequest(`/products/${id}/`, {
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
};

export const deleteProduct = async (id) => {
  return apiRequest(`/products/${id}/`, {
    method: 'DELETE',
  });
};

// Categories API
export const getCategories = async () => {
  return apiRequest('/categories/');
};

export const getCategory = async (id) => {
  return apiRequest(`/categories/${id}/`);
};

export const createCategory = async (data) => {
  return apiRequest('/categories/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateCategory = async (id, data) => {
  return apiRequest(`/categories/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteCategory = async (id) => {
  return apiRequest(`/categories/${id}/`, {
    method: 'DELETE',
  });
};

// Orders API
export const getOrders = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/orders/?${queryString}` : '/orders/';
  return apiRequest(endpoint);
};

export const getOrder = async (id) => {
  return apiRequest(`/orders/${id}/`);
};

export const updateOrder = async (id, data) => {
  return apiRequest(`/orders/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// Users API
export const getUsers = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/users/?${queryString}` : '/users/';
  return apiRequest(endpoint);
};

export const getUser = async (id) => {
  return apiRequest(`/users/${id}/`);
};

export const updateUser = async (id, data) => {
  return apiRequest(`/users/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// Services API
export const getServices = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/services/?${queryString}` : '/services/';
  return apiRequest(endpoint);
};

export const getService = async (id) => {
  return apiRequest(`/services/${id}/`);
};

export const createService = async (data) => {
  return apiRequest('/services/', {
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
};

export const updateService = async (id, data) => {
  return apiRequest(`/services/${id}/`, {
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
};

export const deleteService = async (id) => {
  return apiRequest(`/services/${id}/`, {
    method: 'DELETE',
  });
};

// Reviews API
export const getReviews = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/reviews/?${queryString}` : '/reviews/';
  return apiRequest(endpoint);
};

export const getServiceReviews = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/service-reviews/?${queryString}` : '/service-reviews/';
  return apiRequest(endpoint);
};

// Content API
export const getWebsiteContent = async () => {
  return apiRequest('/website-content/');
};

export const updateWebsiteContent = async (data) => {
  return apiRequest('/website-content/', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// Contact/Inquiries API
export const getInquiries = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/inquiries/?${queryString}` : '/inquiries/';
  return apiRequest(endpoint);
};

export const getInquiry = async (id) => {
  return apiRequest(`/inquiries/${id}/`);
};

export const updateInquiry = async (id, data) => {
  return apiRequest(`/inquiries/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// Dashboard Statistics API
export const getDashboardStats = async () => {
  return apiRequest('/dashboard/stats/');
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

export default {
  // Store Settings
  getStoreSettings,
  updateStoreSettings,
  
  // Products
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  
  // Categories
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  
  // Orders
  getOrders,
  getOrder,
  updateOrder,
  
  // Users
  getUsers,
  getUser,
  updateUser,
  
  // Services
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  
  // Reviews
  getReviews,
  getServiceReviews,
  
  // Content
  getWebsiteContent,
  updateWebsiteContent,
  
  // Inquiries
  getInquiries,
  getInquiry,
  updateInquiry,
  
  // Dashboard
  getDashboardStats,
  
  // Auth
  login,
  logout,
  getCurrentUser,
};
