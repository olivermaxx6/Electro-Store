// Services API utilities

const API_BASE_URL = 'http://127.0.0.1:8001/api/public';

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
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
    console.error(`Services API Error [${endpoint}]:`, error);
    throw error;
  }
};

// Get all services
export const getServices = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/services/?${queryString}` : '/services/';
  return apiRequest(endpoint);
};

// Get service by ID
export const getService = async (id) => {
  return apiRequest(`/services/${id}/`);
};

// Get service categories
export const getServiceCategories = async () => {
  return apiRequest('/service-categories/');
};

// Get service categories that have services
export const getServiceCategoriesWithServices = async () => {
  return apiRequest('/service-categories/with-services/');
};

// Get service reviews
export const getServiceReviews = async (serviceId, params = {}) => {
  const queryParams = { service: serviceId, ...params };
  const queryString = new URLSearchParams(queryParams).toString();
  const endpoint = `/service-reviews/?${queryString}`;
  return apiRequest(endpoint);
};

// Create service review
export const createServiceReview = async (serviceId, reviewData) => {
  console.log('Creating service review with:', { serviceId, reviewData });
  const payload = { ...reviewData, service: serviceId };
  console.log('API payload:', payload);
  
  try {
    const result = await apiRequest('/service-reviews/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    console.log('API response:', result);
    return result;
  } catch (error) {
    console.error('API error details:', error);
    throw error;
  }
};

// Check if user has reviewed service
export const checkUserServiceReview = async (serviceId) => {
  return apiRequest(`/service-reviews/check-user-review/?service=${serviceId}`);
};

// Calculate service statistics
export const calculateServiceStats = (reviews) => {
  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
    return { averageRating: 0, reviewCount: 0 };
  }
  
  const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
  const averageRating = totalRating / reviews.length;
  
  return {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    reviewCount: reviews.length
  };
};

// Submit service query
export const submitServiceQuery = async (serviceId, queryData) => {
  return apiRequest(`/services/${serviceId}/query/`, {
    method: 'POST',
    body: JSON.stringify(queryData),
  });
};

// Increment service view count
export const incrementServiceView = async (serviceId) => {
  return apiRequest(`/services/${serviceId}/increment_view/`, {
    method: 'POST',
  });
};

// Type definitions
export const Service = {
  id: null,
  name: '',
  description: '',
  price: 0,
  category: null,
  duration: '',
  is_active: true,
  image: null,
  reviews_count: 0,
  rating: 0,
  created_at: null
};

export const ServiceCategory = {
  id: null,
  name: '',
  description: '',
  is_active: true,
  services_count: 0,
  created_at: null
};

export const ServiceReview = {
  id: null,
  service: null,
  user: null,
  rating: 0,
  title: '',
  comment: '',
  is_verified: false,
  created_at: null
};

export default {
  getServices,
  getService,
  getServiceCategories,
  getServiceCategoriesWithServices,
  getServiceReviews,
  createServiceReview,
  checkUserServiceReview,
  calculateServiceStats,
  submitServiceQuery,
  incrementServiceView
};
