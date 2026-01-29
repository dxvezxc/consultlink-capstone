import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../Shared/LoadingSpinner'; // Create this component

/**
 * ProtectedRoute - Wrapper component for protected routes
 * @param {Object} props
 * @param {ReactNode} props.children - The component to render if authorized
 * @param {Array} props.allowedRoles - Array of roles allowed to access (optional)
 * @param {boolean} props.redirectToLogin - Whether to redirect to login or dashboard (default: true)
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectToLogin = true 
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" text="Authenticating..." />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    const redirectPath = redirectToLogin 
      ? `/login?redirect=${encodeURIComponent(location.pathname)}`
      : '/';
    return <Navigate to={redirectPath} replace />;
  }

  // Check role-based access if specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    let redirectPath = '/dashboard';
    
    if (user.role === 'teacher') redirectPath = '/teacher-dashboard';
    if (user.role === 'admin') redirectPath = '/admin-dashboard';
    
    return (
      <div className="p-4 text-center">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You don't have permission to access this page.
              </p>
            </div>
          </div>
        </div>
        <Navigate to={redirectPath} replace />
      </div>
    );
  }

  // User is authenticated and has required role
  return children;
};

export default ProtectedRoute;