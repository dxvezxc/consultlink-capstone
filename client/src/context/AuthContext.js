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
      
      console.log('Login attempt:', { identifier, role });
      const response = await authAPI.login({ identifier, password, role });
      console.log('Login response:', response);
      
      if (response.success) {
        // Store token and user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Set user state
        setUser(response.user);
        
        console.log('Login successful, user set:', response.user);
        return { success: true, data: response };
      } else {
        const errorMsg = response.error || 'Login failed';
        console.error('Login failed:', errorMsg);
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle both error object formats:
      // 1. From axios interceptor: {status, message, data}
      // 2. From API: {error: string, message: string}
      const errorMessage = 
        err.message || 
        err.data?.error || 
        err.data?.message || 
        'Login failed. Please try again.';
      
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
    
    // Optional: Redirect to login page
    window.location.href = '/login';
  }, []);

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setError(null);
      // This would call your user update API endpoint
      // For now, just update local state
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true, user: updatedUser };
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      return { success: false, error: err.message };
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