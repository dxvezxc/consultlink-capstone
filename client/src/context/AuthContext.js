import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authAPI } from '../api/auth';

// Create the context
const AuthContext = createContext({});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          // Verify token is still valid by making a me request
          const response = await authAPI.getMe();
          setUser(response.user);
          // Update stored user data
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      } catch (err) {
        // Token is invalid or expired - clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login function
  const login = async (identifier, password, role) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('AuthContext: Login attempt:', { identifier, role });
      const response = await authAPI.login({ identifier, password, role });
      console.log('AuthContext: Login response success:', response);
      
      if (response && response.success) {
        // Store token and user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Set user state
        setUser(response.user);
        
        console.log('AuthContext: Login successful, user set:', response.user);
        return { success: true, data: response };
      } else {
        // API returned an unsuccessful response
        const errorMsg = response?.error || response?.message || 'Login failed. Invalid credentials.';
        console.error('AuthContext: Login response failure:', { response, errorMsg });
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error('AuthContext: ===== LOGIN ERROR CAUGHT =====');
      console.error('AuthContext: err object:', err);
      console.error('AuthContext: err type:', typeof err);
      console.error('AuthContext: err.message:', err?.message);
      console.error('AuthContext: err.status:', err?.status);
      console.error('AuthContext: err.data:', err?.data);
      console.error('AuthContext: ===== END ERROR =====');
      
      // Handle both error object formats:
      // 1. From axios interceptor: {status, message, data}
      // 2. From API: {error: string, message: string}
      // 3. Network error: Error object
      let errorMessage = 'Login failed. Please try again.';
      
      // Try to extract error message from various sources
      if (err?.message && typeof err.message === 'string') {
        console.error('AuthContext: Using err.message:', err.message);
        // Check if message is one of our custom messages
        if (err.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection.';
        } else if (err.message.includes('401') || err.message.includes('unauthorized')) {
          errorMessage = 'Invalid username, email, or password.';
        } else {
          // Use the message as-is
          errorMessage = err.message;
        }
      } else if (err?.data?.error && typeof err.data.error === 'string') {
        console.error('AuthContext: Using err.data.error:', err.data.error);
        errorMessage = err.data.error;
      } else if (err?.data?.message && typeof err.data.message === 'string') {
        console.error('AuthContext: Using err.data.message:', err.data.message);
        errorMessage = err.data.message;
      } else if (typeof err === 'string') {
        console.error('AuthContext: err is string:', err);
        errorMessage = err;
      } else {
        console.error('AuthContext: Could not extract error message from err object');
      }
      
      console.error('AuthContext: Final error message:', errorMessage);
      console.error('AuthContext: Calling setError with:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('AuthContext: Registering user:', userData);
      const response = await authAPI.register(userData);
      console.log('AuthContext: Registration response:', response);
      
      if (response.success) {
        // Store token and user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Set user state
        setUser(response.user);
        
        console.log('AuthContext: Registration successful, user set:', response.user);
        return { success: true, data: response };
      } else {
        const errorMsg = response.error || 'Registration failed';
        console.error('AuthContext: Registration failed:', errorMsg);
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error('AuthContext: Registration error:', err);
      
      // Handle both error object formats:
      // 1. From axios interceptor: {status, message, data}
      // 2. From API: {error: string, message: string}
      const errorMessage = 
        err.message || 
        err.data?.error || 
        err.data?.message || 
        'Registration failed. Please try again.';
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  }, []);

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setError(null);
      console.log('AuthContext: updateProfile called with:', userData);
      console.log('AuthContext: current user:', user);
      
      // Call the API to update the profile on the server
      const response = await authAPI.updateProfile(userData);
      console.log('AuthContext: API response:', response);
      
      // Update local state with the returned user data
      const updatedUser = response.data || response;
      console.log('AuthContext: Updated user:', updatedUser);
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (err) {
      console.error('AuthContext: updateProfile error:', err);
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  };

  // Clear errors
  const clearError = () => setError(null);

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user can access a resource (multiple roles)
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isTeacher: user?.role === 'teacher',
    isAdmin: user?.role === 'admin',
    hasRole,
    hasAnyRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };