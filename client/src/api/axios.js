import axios from 'axios';
// import { toast } from 'react-toastify'; // Uncomment if you want toast notifications

// Create axios instance
const computedBaseURL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? 'http://localhost:5000/api'
  : (process.env.REACT_APP_API_URL || 'http://localhost:5000/api');

const API = axios.create({
  baseURL: computedBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout for slower connections
});

// Automatic retry configuration with exponential backoff
const retryConfig = {
  maxRetries: 3,
  retryDelay: 1000, // Start with 1 second
  retryableStatuses: [408, 429, 500, 502, 503, 504], // Timeout, Rate limit, Server errors
  backoffMultiplier: 2, // Exponential backoff: 1s, 2s, 4s, etc.
};

// Track request attempts and current retries
const requestAttempts = new Map();

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    console.log('[AXIOS REQUEST] URL:', config.url);
    console.log('[AXIOS REQUEST] Token exists:', !!token);
    if (token) {
      console.log('[AXIOS REQUEST] Token preview:', token.substring(0, 30) + '...');
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[AXIOS REQUEST] Authorization header set');
    } else {
      console.warn('[AXIOS REQUEST] ⚠️ NO TOKEN FOUND IN LOCALSTORAGE FOR REQUEST:', config.url);
    }
    
    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    // Track retry count
    config.retryCount = config.retryCount || 0;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response and Error Handler with Automatic Retry
const handleResponseError = async (error) => {
  const { response, config } = error;
  
  console.error('[AXIOS] ===== RESPONSE ERROR INTERCEPTOR =====');
  console.error('[AXIOS] error.config.url:', error.config?.url);
  console.error('[AXIOS] error.message:', error.message);
  console.error('[AXIOS] error.code:', error.code);
  console.error('[AXIOS] response.status:', response?.status);
  console.error('[AXIOS] response.data:', response?.data);
  
  // Check if we should retry this request
  if (config && response && retryConfig.retryableStatuses.includes(response.status)) {
    if (!config.retryCount) config.retryCount = 0;
    
    if (config.retryCount < retryConfig.maxRetries) {
      config.retryCount++;
      
      // Calculate exponential backoff
      const delayMs = retryConfig.retryDelay * Math.pow(retryConfig.backoffMultiplier, config.retryCount - 1);
      const jitter = Math.random() * 100; // Add jitter to prevent thundering herd
      
      console.warn(`[AXIOS] Retrying request (${config.retryCount}/${retryConfig.maxRetries}) after ${delayMs}ms. Status: ${response.status}`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs + jitter));
      
      // Return a new request with updated config
      return API.request(config);
    }
  }
  
  // Handle network errors (no response from server)
  if (!response) {
    console.error('[AXIOS] No response - Network error or timeout');
    
    // Check error code for timeout
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return Promise.reject({
        status: 0,
        message: 'Request timeout. Server is not responding. Please try again.',
        data: { error: 'timeout' },
        fullError: error,
        shouldRetry: true
      });
    }
    
    // Other network errors
    return Promise.reject({
      status: 0,
      message: 'Network error. Please check your connection and try again.',
      data: { error: 'network' },
      fullError: error,
      shouldRetry: true
    });
  }
  
  const { status, data } = response;
  
  console.error('[AXIOS] Extracted status:', status, 'data:', data);
  
  // Handle authentication errors
  if (status === 401) {
    console.error('[AXIOS] 401 Unauthorized detected');
    // Only redirect to login if we have a token (session expired case)
    const token = localStorage.getItem('token');
    const isPasswordChange = error.config?.url?.includes('change-password');
    if (token && !window.location.pathname.includes('/login') && !isPasswordChange) {
      console.error('[AXIOS] Clearing token and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?session=expired';
    }
  }
  
  // Handle service unavailable
  if (status === 503) {
    return Promise.reject({
      status,
      message: 'Server is temporarily unavailable. Please try again in a moment.',
      data: data || { error: 'service_unavailable' },
      fullError: error,
      shouldRetry: true
    });
  }
  
  // Handle rate limiting
  if (status === 429) {
    return Promise.reject({
      status,
      message: 'Too many requests. Please wait a moment before trying again.',
      data: data || { error: 'rate_limited' },
      fullError: error,
      shouldRetry: true
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
    fullError: error,
    shouldRetry: status >= 500 && status < 600 // Retry on 5xx errors
  });
};

// Response interceptor
API.interceptors.response.use(
  (response) => {
    console.log('[AXIOS] Response received:', response.config.url, response.status, response.data);
    // Clear retry count on successful response
    if (response.config) {
      response.config.retryCount = 0;
    }
    return response.data;
  },
  handleResponseError
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

// Set retry configuration (can be modified by components if needed)
API.setRetryConfig = (newConfig) => {
  Object.assign(retryConfig, newConfig);
};

export default API;
export { API as axiosInstance, retryConfig };