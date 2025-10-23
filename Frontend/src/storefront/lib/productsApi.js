// Products API utilities

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
      const errorMessage = errorData.detail || `HTTP ${response.status}: ${response.statusText}`;
      const error = new Error(errorMessage);
      
      // Ensure error has response data
      error.response = { 
        data: errorData, 
        status: response.status,
        statusText: response.statusText
      };
      
      // Also add the data directly to the error for easier access
      error.data = errorData;
      error.status = response.status;
      
      console.error(`Products API Error [${endpoint}]:`, {
        message: errorMessage,
        status: response.status,
        data: errorData
      });
      
      throw error;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Products API Error [${endpoint}]:`, error);
    throw error;
  }
};

// Get product by ID
export const getProduct = async (id) => {
  return apiRequest(`/products/${id}/`);
};

// Get product reviews
export const getProductReviews = async (productId, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString 
    ? `/products/${productId}/reviews/?${queryString}` 
    : `/products/${productId}/reviews/`;
  return apiRequest(endpoint);
};

// Create product review
export const createProductReview = async (reviewData) => {
  return apiRequest(`/reviews/`, {
    method: 'POST',
    body: JSON.stringify(reviewData),
  });
};

// Check if user has reviewed product
export const checkUserProductReview = async (productId) => {
  return apiRequest(`/products/${productId}/reviews/check/`);
};

// Increment product view count
export const incrementProductView = async (productId) => {
  return apiRequest(`/products/${productId}/increment_view/`, {
    method: 'POST',
  });
};

// Get products with filters
export const getProducts = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/products/?${queryString}` : '/products/';
  return apiRequest(endpoint);
};

export default {
  getProduct,
  getProductReviews,
  createProductReview,
  checkUserProductReview,
  incrementProductView,
  getProducts
};
