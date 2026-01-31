import axios from 'axios';
// import { toast } from 'react-toastify'; // Uncomment if you want toast notifications

// Create axios instance
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout for slower connections
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[AXIOS] Token attached to request:', config.url);
    } else {
      console.warn('[AXIOS] No token found for request:', config.url);
    }
    
    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    console.log('[AXIOS] Response received:', response.config.url, response.status, response.data);
    // You can transform response data here
    return response.data;
  },
  (error) => {
    const { response } = error;
    
    console.error('[AXIOS] ===== RESPONSE ERROR INTERCEPTOR =====');
    console.error('[AXIOS] error.config.url:', error.config?.url);
    console.error('[AXIOS] error.message:', error.message);
    console.error('[AXIOS] error.code:', error.code);
    console.error('[AXIOS] response.status:', response?.status);
    console.error('[AXIOS] response.data:', response?.data);
    
    // Handle network errors (no response from server)
    if (!response) {
      console.error('[AXIOS] No response - Network error or timeout');
      
      // Check error code for timeout
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return Promise.reject({
          status: 0,
          message: 'Request timeout. Server is not responding. Please try again.',
          data: { error: 'timeout' },
          fullError: error
        });
      }
      
      // Other network errors
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your connection and try again.',
        data: { error: 'network' },
        fullError: error
      });
    }
    
    const { status, data } = response;
    
    console.error('[AXIOS] Extracted status:', status, 'data:', data);
    
    // Handle authentication errors
    if (status === 401) {
      console.error('[AXIOS] 401 Unauthorized detected');
      // Only redirect to login if we have a token (session expired case)
      // Don't redirect for login page login attempts
      const token = localStorage.getItem('token');
      if (token && !window.location.pathname.includes('/login')) {
        console.error('[AXIOS] Clearing token and redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?session=expired';
      } else {
        console.error('[AXIOS] No token or on login page - not redirecting, just rejecting error');
      }
    }
    
    // Handle service unavailable
    if (status === 503) {
      return Promise.reject({
        status,
        message: 'Server is temporarily unavailable. Please try again in a moment.',
        data: data || { error: 'service_unavailable' },
        fullError: error
      });
    }
    
    // Handle other errors
    const errorMessage = data?.error || data?.message || `Server error (${status})`;
    
    console.error('[AXIOS] Final error message:', errorMessage);
    console.error('[AXIOS] Rejecting with:', { status, message: errorMessage, data });
    console.error('[AXIOS] ===== END RESPONSE ERROR =====');
    
    return Promise.reject({
      status,
      message: errorMessage,
      data: data || {},
      fullError: error
    });
  }
);

// Helper methods
API.upload = (url, formData, config = {}) => {
  return API.post(url, formData, {
    ...config,
    headers: {
      ...config.headers,
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default API;