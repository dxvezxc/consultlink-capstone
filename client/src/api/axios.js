import axios from 'axios';
// import { toast } from 'react-toastify'; // Uncomment if you want toast notifications

// Create axios instance
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
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
    
    console.error('[AXIOS] Response error:', {
      url: error.config?.url,
      status: response?.status,
      data: response?.data,
      message: error.message
    });
    
    // Handle network errors
    if (!response) {
      console.error('Network error:', error);
      // You can show a toast notification here
      // toast.error('Network error. Please check your connection.');
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    const { status, data } = response;
    
    console.error('API Error:', {
      status,
      data,
      url: error.config?.url,
      method: error.config?.method
    });
    
    // Handle authentication errors
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?session=expired';
      }
    }
    
    // Handle other errors
    const errorMessage = data?.error || data?.message || `Server error (${status})`;
    
    // Show error toast (optional)
    // toast.error(errorMessage);
    
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