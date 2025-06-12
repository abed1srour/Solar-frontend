/**
 * API Configuration
 * 
 * This file centralizes API configuration for easier management
 */

// The base URL for all API calls
export const API_BASE_URL = 'https://solar-backend-opi8.onrender.com';

// Helper function to generate full API URLs
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  PRODUCTS: 'api/products',
  AUTH: {
    LOGIN: 'api/auth/login',
    REGISTER: 'api/auth/register',
    LOGOUT: 'api/auth/logout'
  }
};

export default {
  API_BASE_URL,
  getApiUrl,
  API_ENDPOINTS
}; 