// Admin API configuration with enhanced authentication handling
import { apiRequest, getAuthToken, isUserAuthenticated } from './apiInterceptor';

// Re-export the enhanced functions for backward compatibility
export { getAuthToken, isUserAuthenticated };

// Service Categories API
export const listServiceCategories = async () => {
  return apiRequest('/admin/service-categories/');
};

export const getServiceCategoryTree = async () => {
  return apiRequest('/admin/service-categories/tree/');
};

export const createServiceCategory = async (data) => {
  return apiRequest('/admin/service-categories/', {
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
};

export const updateServiceCategory = async (id, data) => {
  return apiRequest(`/admin/service-categories/${id}/`, {
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
};

export const deleteServiceCategory = async (id) => {
  return apiRequest(`/admin/service-categories/${id}/`, {
    method: 'DELETE',
  });
};

// Services API
export const listServices = async (params = {}) => {
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

// Service Images API
export const setMainServiceImage = async (serviceId, imageId) => {
  return apiRequest(`/admin/services/${serviceId}/set-main-image/`, {
    method: 'POST',
    body: JSON.stringify({ image_id: imageId }),
  });
};

// Products API
export const listProducts = async (params = {}) => {
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

// Product Images API
export const uploadProductImages = async (productId, images) => {
  const formData = new FormData();
  images.forEach((image, index) => {
    formData.append(`images`, image);
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

export const setMainProductImage = async (productId, imageId) => {
  return apiRequest(`/admin/products/${productId}/set-main-image/`, {
    method: 'POST',
    body: JSON.stringify({ image_id: imageId }),
  });
};

// Brands API
export const listBrands = async () => {
  try {
    // Try admin API endpoint first for authenticated admin access
    return await apiRequest('/admin/brands/');
  } catch (error) {
    console.warn('Admin brands API failed, falling back to public API:', error);
    // Fallback to public API if admin API fails (e.g., not authenticated)
    return apiRequest('/public/brands/');
  }
};

export const createBrand = async (data) => {
  return apiRequest('/admin/brands/', {
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
};

export const updateBrand = async (id, data) => {
  return apiRequest(`/admin/brands/${id}/`, {
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
};

export const deleteBrand = async (id) => {
  return apiRequest(`/admin/brands/${id}/`, {
    method: 'DELETE',
  });
};

// Categories API
export const listTopCategories = async () => {
  try {
    // Try admin API endpoint first for authenticated admin access
    return await apiRequest('/admin/categories/?top=true');
  } catch (error) {
    console.warn('Admin categories API failed, falling back to public API:', error);
    // Fallback to public API if admin API fails (e.g., not authenticated)
    return apiRequest('/public/categories/?top=true');
  }
};

export const listSubcategories = async (parentId) => {
  try {
    // Try admin API endpoint first for authenticated admin access
    return await apiRequest(`/admin/categories/?parent=${parentId}`);
  } catch (error) {
    console.warn('Admin subcategories API failed, falling back to public API:', error);
    // Fallback to public API if admin API fails (e.g., not authenticated)
    return await apiRequest(`/public/categories/?parent=${parentId}`);
  }
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
  return apiRequest(`/admin/categories/${id}/`, {
    method: 'DELETE',
  });
};

// Orders API
export const listOrders = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/admin/orders/?${queryString}` : '/admin/orders/';
  return apiRequest(endpoint);
};

export const updateOrder = async (id, data) => {
  return apiRequest(`/admin/orders/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteOrder = async (id) => {
  return apiRequest(`/admin/orders/${id}/`, {
    method: 'DELETE',
  });
};

// Users API
export const listUsers = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/admin/users/?${queryString}` : '/admin/users/';
  return apiRequest(endpoint);
};

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

// Reviews API
export const listReviews = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/admin/reviews/?${queryString}` : '/admin/reviews/';
  return apiRequest(endpoint);
};

export const deleteReview = async (id) => {
  return apiRequest(`/admin/reviews/${id}/`, {
    method: 'DELETE',
  });
};

// Service Reviews API
export const listServiceReviews = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/admin/service-reviews/?${queryString}` : '/admin/service-reviews/';
  return apiRequest(endpoint);
};

export const deleteServiceReview = async (id) => {
  return apiRequest(`/admin/service-reviews/${id}/`, {
    method: 'DELETE',
  });
};

export const markServiceReviewVerified = async (id) => {
  return apiRequest(`/admin/service-reviews/${id}/verify/`, {
    method: 'POST',
  });
};

export const markServiceReviewUnverified = async (id) => {
  return apiRequest(`/admin/service-reviews/${id}/unverify/`, {
    method: 'POST',
  });
};

// Content API
export const getContent = async () => {
  return apiRequest('/admin/website-content/');
};

export const updateContent = async (data) => {
  return apiRequest('/admin/website-content/', {
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
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

// Inquiries API
export const listInquiries = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/admin/inquiries/?${queryString}` : '/admin/inquiries/';
  return apiRequest(endpoint);
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

// Dashboard API
export const getDashboardStats = async () => {
  return apiRequest('/admin/dashboard/stats/');
};

// Authentication API - using token-based system
// checkAuthentication is no longer needed as AuthGuard handles this

// Auth Store - Import from the actual auth store
import { useAuth } from '../store/authStore';
export const authStore = useAuth;

// HTTP method helpers for backward compatibility
const apiPost = async (endpoint, data) => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
};

const apiGet = async (endpoint) => {
  return apiRequest(endpoint);
};

const apiPut = async (endpoint, data) => {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
};

const apiDelete = async (endpoint) => {
  return apiRequest(endpoint, {
    method: 'DELETE',
  });
};

// Default API object for backward compatibility
export const api = {
  // HTTP Methods
  post: apiPost,
  get: apiGet,
  put: apiPut,
  delete: apiDelete,
  
  // Products
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
  setMainProductImage,
  
  // Brands
  listBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  
  // Categories
  listTopCategories,
  listSubcategories,
  createCategory,
  updateCategory,
  deleteCategory,
  
  // Orders
  listOrders,
  updateOrder,
  deleteOrder,
  
  // Users
  listUsers,
  deleteUser,
  suspendUser,
  unsuspendUser,
  
  // Reviews
  listReviews,
  deleteReview,
  
  // Service Reviews
  listServiceReviews,
  deleteServiceReview,
  markServiceReviewVerified,
  markServiceReviewUnverified,
  
  // Service Categories
  listServiceCategories,
  getServiceCategoryTree,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  
  // Services
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
  
  // Service Images
  setMainServiceImage,
  
  // Content
  getContent,
  updateContent,
  
  // Store Settings
  getStoreSettings,
  updateStoreSettings,
  
  // Inquiries
  listInquiries,
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
  
  // Authentication
  // checkAuthentication removed - use AuthGuard instead
};

export default api;
