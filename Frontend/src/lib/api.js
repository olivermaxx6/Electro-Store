// API configuration
const API_BASE_URL = 'http://127.0.0.1:8001/api';

// Helper function to get auth token
const getAuthToken = () => {
  // Try to get token from auth store format first
  const authData = JSON.parse(localStorage.getItem('auth') || '{}');
  if (authData.access) {
    return authData.access;
  }
  
  // Fallback to direct token storage
  return localStorage.getItem('authToken') || 
         localStorage.getItem('access_token') || 
         sessionStorage.getItem('authToken');
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
    
    // Handle empty responses (like DELETE requests that return 204 No Content)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return { success: true, status: response.status };
    }
    
    // Check if response has content before trying to parse JSON
    const text = await response.text();
    if (!text.trim()) {
      return { success: true, status: response.status };
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
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
    body: JSON.stringify(data),
  });
};

export const updateCategory = async (id, data) => {
  return apiRequest(`/admin/categories/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteCategory = async (id) => {
  return apiRequest(`/admin/categories/${id}/`, {
    method: 'DELETE',
  });
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
  const endpoint = queryString ? `/admin/inquiries/?${queryString}` : '/admin/inquiries/';
  return apiRequest(endpoint);
};

export const getInquiry = async (id) => {
  return apiRequest(`/admin/inquiries/${id}/`);
};

export const updateInquiry = async (id, data) => {
  return apiRequest(`/admin/inquiries/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// Contact Messages API
export const listContacts = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/admin/contacts/?${queryString}` : '/admin/contacts/';
  return apiRequest(endpoint);
};

export const markContactAsRead = async (id) => {
  return apiRequest(`/admin/contacts/${id}/mark_as_read/`, {
    method: 'PATCH',
  });
};

export const markContactAsReplied = async (id) => {
  return apiRequest(`/admin/contacts/${id}/mark_as_replied/`, {
    method: 'PATCH',
  });
};

export const closeContact = async (id) => {
  return apiRequest(`/admin/contacts/${id}/close/`, {
    method: 'PATCH',
  });
};

export const deleteContact = async (id) => {
  return apiRequest(`/admin/contacts/${id}/`, {
    method: 'DELETE',
  });
};

// Service Queries API
export const listServiceQueries = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/admin/service-queries/?${queryString}` : '/admin/service-queries/';
  return apiRequest(endpoint);
};

export const markServiceQueryAsRead = async (id) => {
  return apiRequest(`/admin/service-queries/${id}/mark_as_read/`, {
    method: 'PATCH',
  });
};

export const markServiceQueryAsReplied = async (id) => {
  return apiRequest(`/admin/service-queries/${id}/mark_as_replied/`, {
    method: 'PATCH',
  });
};

export const closeServiceQuery = async (id) => {
  return apiRequest(`/admin/service-queries/${id}/close/`, {
    method: 'PATCH',
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
    body: JSON.stringify({ username: email, password }),
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
  
  // Contact Messages
  listContacts,
  markContactAsRead,
  markContactAsReplied,
  closeContact,
  deleteContact,
  
  // Service Queries
  listServiceQueries,
  markServiceQueryAsRead,
  markServiceQueryAsReplied,
  closeServiceQuery,
  deleteServiceQuery,
  
  // Dashboard
  getDashboardStats,
  
  // Auth
  login,
  logout,
  getCurrentUser,
};
