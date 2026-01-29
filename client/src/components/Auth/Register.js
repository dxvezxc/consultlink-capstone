import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

const Register = () => {
  const navigate = useNavigate();
  const { register, error, clearError, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentID: "",
    password: "",
    confirmPassword: "",
    role: "student" // Always student for self-registration
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear specific field validation error when user types
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ""
      });
    }

    // Clear submission error when user starts typing
    if (validationErrors.submit) {
      setValidationErrors({
        ...validationErrors,
        submit: ""
      });
    }

    // Clear general auth error when user starts typing
    if (error) clearError();
  };

  // Validate student ID format
  const validateStudentID = (id) => {
    const idFormat = /^\d{2}-\d{4}-\d{3}$/;
    return idFormat.test(id);
  };

  // Validate email format
  const validateEmail = (email) => {
    const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailFormat.test(email);
  };

  // Validate password strength
  const validatePassword = (password) => {
    const minLength = 6;
    const hasNumber = /\d/;
    return password.length >= minLength && hasNumber.test(password);
  };

  // Validate all fields
  const validateForm = () => {
    const errors = {};

    // Student ID validation
    if (!formData.studentID) {
      errors.studentID = "Student ID is required";
    } else if (!validateStudentID(formData.studentID)) {
      errors.studentID = "Use format: YY-XXXX-XXX (e.g., 24-0329-818)";
    }

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      errors.password = "Password must be at least 6 characters and contain a number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Register form submitted');
    console.log('Form data:', formData);

    // Validate form
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    // Prepare data for registration (remove confirmPassword)
    const userData = {
      name: formData.name.trim(),
      email: formData.email.toLowerCase(),
      studentID: formData.studentID,
      password: formData.password,
      role: "student"
    };

    console.log('Submitting registration:', userData);
    const result = await register(userData);
    console.log('Registration result:', result);
    
    if (result.success) {
      console.log('Registration successful!');
      // Navigate to the appropriate dashboard based on role
      let dashboard = "/dashboard";
      if (result.data.user.role === "teacher") {
        dashboard = "/teacher-dashboard";
      } else if (result.data.user.role === "admin") {
        dashboard = "/admin-dashboard";
      }
      
      console.log('Navigating to:', dashboard);
      // Redirect to dashboard
      navigate(dashboard, { replace: true });
    } else {
      console.error('Registration failed:', result.error);
      // Update error state instead of using alert
      setValidationErrors({
        submit: result.error || 'Registration failed. Please try again.'
      });
    }
  };

  // Check if form is valid for enabling submit button
  const isFormValid = () => {
    const valid = (
      formData.studentID &&
      formData.name.trim() &&
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword &&
      validateStudentID(formData.studentID) &&
      validateEmail(formData.email) &&
      validatePassword(formData.password)
    );
    
    // Debug logging
    if (!valid) {
      console.log('Form validation status:', {
        hasStudentID: !!formData.studentID,
        hasName: !!formData.name.trim(),
        hasEmail: !!formData.email,
        hasPassword: !!formData.password,
        hasConfirmPassword: !!formData.confirmPassword,
        passwordsMatch: formData.password === formData.confirmPassword,
        validStudentID: validateStudentID(formData.studentID),
        validEmail: validateEmail(formData.email),
        validPassword: validatePassword(formData.password)
      });
    }
    
    return valid;
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h2>Create Student Account</h2>

        {/* Auth Context Error Display */}
        {error && (
          <div className="auth-error" style={{ 
            background: "#fee", 
            border: "2px solid #f99", 
            borderRadius: "6px", 
            padding: "12px 16px", 
            marginBottom: "20px", 
            color: "#c00",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
            fontWeight: "500"
          }}>
            <span style={{fontSize: "18px"}}>❌</span>
            <div>
              <strong>Registration Error!</strong>
              <div style={{fontSize: "13px", marginTop: "4px", color: "#a00"}}>
                {error}
              </div>
            </div>
          </div>
        )}

        {/* Submission Error Display */}
        {validationErrors.submit && (
          <div className="auth-error" style={{ 
            background: "#fee", 
            border: "2px solid #f99", 
            borderRadius: "6px", 
            padding: "12px 16px", 
            marginBottom: "20px", 
            color: "#c00",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
            fontWeight: "500"
          }}>
            <span style={{fontSize: "18px"}}>⚠</span>
            <div>
              <strong>Cannot Create Account</strong>
              <div style={{fontSize: "13px", marginTop: "4px", color: "#a00"}}>
                {validationErrors.submit}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Student ID Field */}
          <div className="form-group">
            <label htmlFor="studentID">Student ID</label>
            <input
              id="studentID"
              type="text"
              name="studentID"
              placeholder="24-0329-818"
              value={formData.studentID}
              onChange={handleChange}
              disabled={loading}
              className={validationErrors.studentID ? "input-error" : ""}
            />
            {validationErrors.studentID && (
              <div className="validation-error">
                {validationErrors.studentID}
              </div>
            )}
            <div className="input-hint">
              Format: YY-XXXX-XXX (Year-Digits-Code)
            </div>
          </div>

          {/* Full Name Field */}
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Juan Dela Cruz"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              className={validationErrors.name ? "input-error" : ""}
            />
            {validationErrors.name && (
              <div className="validation-error">
                {validationErrors.name}
              </div>
            )}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="student@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className={validationErrors.email ? "input-error" : ""}
            />
            {validationErrors.email && (
              <div className="validation-error">
                {validationErrors.email}
              </div>
            )}
            <div className="input-hint">
              Use your institutional email if available
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter password (min. 6 characters with a number)"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className={validationErrors.password ? "input-error" : ""}
            />
            {validationErrors.password && (
              <div className="validation-error">
                {validationErrors.password}
              </div>
            )}
            <div className="password-strength">
              {formData.password && (
                <>
                  <div className={`strength-indicator ${validatePassword(formData.password) ? 'strong' : 'weak'}`}></div>
                  <span className="strength-text">
                    {validatePassword(formData.password) ? 'Strong password' : 'Weak password'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              className={validationErrors.confirmPassword ? "input-error" : ""}
            />
            {validationErrors.confirmPassword && (
              <div className="validation-error">
                {validationErrors.confirmPassword}
              </div>
            )}
            {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
              <div className="validation-success">
                ✓ Passwords match
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading || !isFormValid()}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        {/* Links */}
        <div className="auth-links">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Login here
            </Link>
          </p>
          <p>
            <Link to="/" className="auth-link">
              ← Back to Home
            </Link>
          </p>
        </div>

        {/* Registration Guidelines */}
        <div className="demo-credentials">
          <p className="demo-title">Registration Guidelines:</p>
          <ul className="demo-list">
            <li>Only students can self-register</li>
            <li>Teachers are registered by administrators</li>
            <li>Use your official student ID</li>
            <li>Keep your password secure</li>
            <li>Contact admin if you encounter issues</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Register;