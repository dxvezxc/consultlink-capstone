import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, clearError, loading } = useAuth();

  // Get redirect path from URL or default based on role
  const from = location.state?.from?.pathname || 
               new URLSearchParams(location.search).get('redirect') || 
               null;

  const [role, setRole] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [errorType, setErrorType] = useState(null);
  const [showRetryButton, setShowRetryButton] = useState(false);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
    setErrorType(null);
    setShowRetryButton(false);
  }, [clearError]);

  // Categorize error type based on error message
  const categorizeError = (errorMsg) => {
    if (!errorMsg) return null;
    
    const msg = errorMsg.toLowerCase();
    
    if (msg.includes('network') || msg.includes('connection') || msg.includes('timeout') || msg.includes('unreachable')) {
      return 'network';
    }
    if (msg.includes('too many') || msg.includes('locked') || msg.includes('rate limit') || msg.includes('attempts')) {
      return 'rate_limit';
    }
    if (msg.includes('invalid') || msg.includes('incorrect') || msg.includes('wrong')) {
      return 'auth_failed';
    }
    if (msg.includes('not found') || msg.includes('does not exist')) {
      return 'not_found';
    }
    if (msg.includes('session') || msg.includes('expired') || msg.includes('unauthorized')) {
      return 'session';
    }
    if (msg.includes('required') || msg.includes('missing')) {
      return 'validation';
    }
    return 'unknown';
  };

  // Update error type when error changes
  useEffect(() => {
    if (error) {
      console.log('Login component: Error detected:', error);
      const type = categorizeError(error);
      console.log('Login component: Error type:', type);
      setErrorType(type);
      
      // Show retry button for network errors after 2 seconds
      if (type === 'network') {
        setTimeout(() => setShowRetryButton(true), 500);
      }
      
      // Increment failed attempts for auth failures
      if (type === 'auth_failed' || type === 'not_found') {
        setFailedAttempts(prev => prev + 1);
      }
    } else {
      // Error was cleared
      setErrorType(null);
      setShowRetryButton(false);
    }
  }, [error]);

  // Auto-focus the identifier field when role is selected
  useEffect(() => {
    if (role && !identifier) {
      document.getElementById("identifier-input")?.focus();
    }
  }, [role, identifier]);

  // Validate identifier format based on role
  const validateIdentifier = (value, selectedRole) => {
    if (!value) {
      return "This field is required";
    }
    if (selectedRole === "student") {
      const idFormat = /^\d{2}-\d{4}-\d{3}$/;
      const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!idFormat.test(value) && !emailFormat.test(value)) {
        return "Enter Student ID (YY-XXXX-XXX) or Email";
      }
    }
    if (selectedRole === "teacher" && value.length < 2) {
      return "Please enter a valid teacher name or email";
    }
    if (selectedRole === "admin") {
      const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailFormat.test(value)) {
        return "Please enter a valid email address";
      }
    }
    return "";
  };

  // Validate password
  const validatePassword = (value) => {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  // Handle field blur
  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validateField(field);
  };

  // Validate single field
  const validateField = (field) => {
    let error = "";
    
    if (field === "identifier") {
      error = validateIdentifier(identifier, role);
    } else if (field === "password") {
      error = validatePassword(password);
    }
    
    setFieldErrors({ ...fieldErrors, [field]: error });
    return !error;
  };

  const handleIdentifierChange = (e) => {
    const value = e.target.value;
    setIdentifier(value);
    
    if (touched.identifier) {
      validateField("identifier");
    }
    
    setAttemptedSubmit(false);
  };

  // Handle password change with real-time validation
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    if (touched.password) {
      validateField("password");
    }
    
    setAttemptedSubmit(false);
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setRole(newRole);
    setIdentifier("");
    setFieldErrors({});
    setTouched({});
    setAttemptedSubmit(false);
    clearError();
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    console.log('=== LOGIN FORM SUBMITTED ===');
    setAttemptedSubmit(true);

    if (!role) {
      console.log('No role selected');
      setFieldErrors({ role: "Please select a user type" });
      return;
    }

    // Validate all fields
    const identifierError = validateIdentifier(identifier, role);
    const passwordError = validatePassword(password);

    if (identifierError || passwordError) {
      console.log('Validation errors:', { identifierError, passwordError });
      setFieldErrors({
        identifier: identifierError,
        password: passwordError
      });
      setTouched({ identifier: true, password: true });
      return;
    }

    console.log('Submitting login form...', { identifier, role });
    const result = await login(identifier, password, role);
    console.log('Login result received:', result);
    
    if (result.success) {
      console.log('Login successful');
      // Navigate to the appropriate dashboard
      let dashboard = "/dashboard";
      if (result.data.user.role === "teacher") {
        dashboard = "/teacher-dashboard";
      } else if (result.data.user.role === "admin") {
        dashboard = "/admin-dashboard";
      }

      console.log('Navigating to:', from || dashboard);
      navigate(from || dashboard, { replace: true });
    } else {
      console.log('Login failed. Error:', result.error);
      // Error is already set in AuthContext by the login function
      // Just focus on first field for accessibility
      document.getElementById("identifier-input")?.focus();
    }
    console.log('=== LOGIN SUBMISSION COMPLETE ===');
  };

  // Get placeholder based on role
  const getIdentifierPlaceholder = () => {
    switch (role) {
      case "student":
        return "e.g., 24-0329-818 or student@example.com";
      case "teacher":
        return "e.g., Dr. Smith or teacher@example.com";
      case "admin":
        return "admin@example.com";
      default:
        return "Enter your identifier";
    }
  };

  // Get label based on role
  const getIdentifierLabel = () => {
    switch (role) {
      case "student":
        return "Student ID or Email";
      case "teacher":
        return "Teacher Name or Email";
      case "admin":
        return "Admin Email";
      default:
        return "Identifier";
    }
  };

  // Get hint based on error type
  const getHint = () => {
    if (!error) return null;
    
    switch (errorType) {
      case 'network':
        return "Unable to connect to server. Check your internet connection and try again.";
      case 'rate_limit':
        return "Too many login attempts. Please wait a few minutes before trying again.";
      case 'auth_failed':
        return "Incorrect credentials. Double-check your password and selected user type.";
      case 'not_found':
        return "No account found with these credentials. Check your details or create a new account.";
      case 'session':
        return "Your session has expired. Please try logging in again.";
      case 'validation':
        return "Please fill in all required fields with valid information.";
      default:
        return "An error occurred. Please try again or contact support if the problem persists.";
    }
  };

  // Get icon for error type
  const getErrorIcon = () => {
    switch (errorType) {
      case 'network':
        return "🌐";
      case 'rate_limit':
        return "⏱️";
      case 'auth_failed':
        return "🔐";
      case 'not_found':
        return "🔍";
      case 'session':
        return "⏰";
      case 'validation':
        return "✓";
      default:
        return "❌";
    }
  };

  // Reset error and failed attempts
  const handleClearError = () => {
    clearError();
    setErrorType(null);
    setShowRetryButton(false);
  };

  // Retry failed login
  const handleRetry = async () => {
    if (!identifier || !password || !role) return;
    
    clearError();
    setShowRetryButton(false);
    await handleSubmit({ preventDefault: () => {} });
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h2>Login to Consultation System</h2>
        <p style={{ textAlign: "center", color: "#64748b", marginBottom: "24px", fontSize: "14px" }}>
          Welcome back! Sign in to your account
        </p>

        {/* Error Display */}
        {error && (
          <div className={`auth-error auth-error-${errorType}`} role="alert" aria-live="polite">
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '16px' }}>{getErrorIcon()}</span>
                <strong>Login Failed</strong>
              </div>
              <div style={{ fontSize: '13px', marginLeft: '24px', opacity: 0.9, marginBottom: '8px' }}>
                {error}
              </div>
              {getHint() && (
                <div style={{ fontSize: '12px', marginLeft: '24px', opacity: 0.8, fontStyle: "italic", marginBottom: '8px' }}>
                  💡 {getHint()}
                </div>
              )}
              
              {/* Failed Attempts Warning */}
              {failedAttempts >= 3 && failedAttempts < 5 && (
                <div style={{ fontSize: '12px', marginLeft: '24px', opacity: 0.85, color: '#7c2d12', marginBottom: '8px' }}>
                  ⚠️ You have {5 - failedAttempts} attempts remaining
                </div>
              )}
              
              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginLeft: '24px', marginTop: '12px', flexWrap: 'wrap' }}>
                {showRetryButton && errorType === 'network' && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    disabled={loading}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      backgroundColor: '#f97316',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                      transition: 'opacity 0.2s'
                    }}
                  >
                    {loading ? 'Retrying...' : 'Retry'}
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={handleClearError}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    backgroundColor: 'transparent',
                    color: 'inherit',
                    border: '1px solid currentColor',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    opacity: 0.7,
                    transition: 'opacity 0.2s'
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Role Selection */}
        <div className="form-group">
          <label>User Type *</label>
          <select
            value={role}
            onChange={handleRoleChange}
            onBlur={() => handleBlur("role")}
            disabled={loading}
            className={fieldErrors.role ? "input-error" : ""}
          >
            <option value="">-- Select Role --</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
          {fieldErrors.role && (
            <div className="validation-error">{fieldErrors.role}</div>
          )}
        </div>

        {role && (
          <form onSubmit={handleSubmit}>
            {/* Identifier Field */}
            <div className="form-group">
              <label>{getIdentifierLabel()} *</label>
              <input
                id="identifier-input"
                type="text"
                placeholder={getIdentifierPlaceholder()}
                value={identifier}
                onChange={handleIdentifierChange}
                onBlur={() => handleBlur("identifier")}
                disabled={loading}
                className={fieldErrors.identifier ? "input-error" : ""}
                autoComplete="off"
                aria-describedby={fieldErrors.identifier ? "identifier-error" : "identifier-hint"}
              />
              {fieldErrors.identifier && (
                <div id="identifier-error" className="validation-error" role="alert">
                  {fieldErrors.identifier}
                </div>
              )}
              {!fieldErrors.identifier && role && (
                <div id="identifier-hint" className="input-hint">
                  {role === "student" && "Format: YY-XXXX-XXX (e.g., 24-0329-818) or your email"}
                  {role === "teacher" && "Your name or institutional email"}
                  {role === "admin" && "Your admin email address"}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => handleBlur("password")}
                disabled={loading}
                className={fieldErrors.password ? "input-error" : ""}
                autoComplete="current-password"
                aria-describedby={fieldErrors.password ? "password-error" : "password-hint"}
              />
              {fieldErrors.password && (
                <div id="password-error" className="validation-error" role="alert">
                  {fieldErrors.password}
                </div>
              )}
              {!fieldErrors.password && password && (
                <div id="password-hint" className="input-hint password-hint">
                  {password.length < 6 && `${6 - password.length} more character${6 - password.length !== 1 ? 's' : ''} required`}
                  {password.length >= 6 && password.length < 12 && "✓ Password strength: Weak"}
                  {password.length >= 12 && password.length < 16 && "✓ Password strength: Fair"}
                  {password.length >= 16 && "✓ Password strength: Good"}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading || (attemptedSubmit && (!identifier || !password || !role))}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
        )}

        {/* Links */}
        <div className="auth-link">
          <p>
            <Link to="/register">Create a student account →</Link>
          </p>
          <p>
            <Link to="/forgot-password">Forgot your password?</Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="demo-credentials">
          <p><strong>Demo Credentials:</strong></p>
          <ul className="demo-list">
            <li><strong>Student:</strong> 12-1234-123 / Student@123</li>
            <li><strong>Teacher:</strong> Dr. Smith / Teacher@123</li>
            <li><strong>Admin:</strong> admin@consultlink.local / Admin@123</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;