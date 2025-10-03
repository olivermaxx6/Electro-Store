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
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
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
  const queryParams = { product: productId, ...params };
  const queryString = new URLSearchParams(queryParams).toString();
  const endpoint = `/reviews/?${queryString}`;
  console.log('productsApi: getProductReviews called with:', { productId, params, endpoint });
  try {
    const result = await apiRequest(endpoint);
    console.log('productsApi: getProductReviews success:', result);
    return result;
  } catch (error) {
    console.error('productsApi: getProductReviews error:', error);
    throw error;
  }
};

// Create product review
export const createProductReview = async (reviewData) => {
  console.log('productsApi: createProductReview called with:', reviewData);
  try {
    const result = await apiRequest('/reviews/', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
    console.log('productsApi: createProductReview success:', result);
    return result;
  } catch (error) {
    console.error('productsApi: createProductReview error:', error);
    throw error;
  }
};

// Check if user has reviewed product
export const checkUserProductReview = async (productId) => {
  return apiRequest(`/reviews/check-user-review/?product=${productId}`);
};

// Increment product view count
export const incrementProductView = async (productId) => {
  return apiRequest(`/products/${productId}/view/`, {
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
