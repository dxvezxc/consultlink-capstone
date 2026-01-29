import API from './axios';

export const authAPI = {
  // Login with identifier (email, studentID, or name) and password
  login: (credentials) => 
    API.post('/auth/login', credentials),
  
  // Register new user
  register: (userData) => 
    API.post('/auth/register', userData),
  
  // Get current user profile
  getMe: () => 
    API.get('/auth/me'),
  
  // Logout (client-side only, server would invalidate token)
  logout: () => {
    // In a real app, you might call an API to invalidate the token
    return Promise.resolve({ success: true });
  },
  
  // Update user profile (to implement later)
  updateProfile: (userData) => 
    API.put('/users/profile', userData),
  
  // Change password (to implement later)
  changePassword: (passwords) => 
    API.put('/users/change-password', passwords)
};