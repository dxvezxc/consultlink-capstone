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
      errors.studentID = "Format: YY-XXXX-XXX (e.g., 24-0329-818)";
    }

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    } else if (formData.name.trim().length > 50) {
      errors.name = "Name must not exceed 50 characters";
    }

    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email (e.g., name@example.com)";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      errors.password = "Min. 6 characters with at least one number";
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

  // Get password strength
  const getPasswordStrength = (password) => {
    if (!password) return "";
    if (password.length < 6) return "weak";
    if (password.length < 10 && /\d/.test(password)) return "medium";
    if (/[A-Z]/.test(password) && /\d/.test(password)) return "strong";
    return "medium";
  };

  // Get helpful error hint
  const getErrorHint = (errorMsg) => {
    if (errorMsg?.toLowerCase().includes("already")) {
      return "This email or student ID is already registered. Try logging in instead.";
    }
    if (errorMsg?.toLowerCase().includes("email")) {
      return "Make sure you're using a valid, accessible email address.";
    }
    if (errorMsg?.toLowerCase().includes("network") || errorMsg?.toLowerCase().includes("connection")) {
      return "Connection error. Check your internet and try again.";
    }
    return null;
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

    // Prepare data for registration
    const userData = {
      name: formData.name.trim(),
      email: formData.email.toLowerCase().trim(),
      studentID: formData.studentID.trim(),
      password: formData.password,
      role: "student"
    };

    console.log('Submitting registration:', userData);
    const result = await register(userData);
    console.log('Registration result:', result);
    
    if (result.success) {
      console.log('Registration successful!');
      navigate("/dashboard", { replace: true });
    } else {
      console.error('Registration failed:', result.error);
      // Check if it's a student ID or email duplicate error
      const serverError = result.error || 'Registration failed. Please try again.';
      if (serverError.toLowerCase().includes("student")) {
        setValidationErrors({ studentID: "This student ID is already registered" });
      } else if (serverError.toLowerCase().includes("email")) {
        setValidationErrors({ email: "This email is already registered" });
      } else {
        setValidationErrors({ submit: serverError });
      }
      
      if (error) clearError();
    }
  };

  // Check if form is valid for enabling submit button
  const isFormValid = () => {
    return (
      formData.studentID &&
      formData.name.trim() &&
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword &&
      validateStudentID(formData.studentID) &&
      validateEmail(formData.email) &&
      validatePassword(formData.password) &&
      !Object.values(validationErrors).some(e => e)
    );
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h2>Create Student Account</h2>
        <p style={{ textAlign: "center", color: "#64748b", marginBottom: "24px", fontSize: "14px" }}>
          Join ConsultLink and book consultations with teachers
        </p>

        {/* Auth Context Error Display */}
        {error && (
          <div className="auth-error">
            <div style={{ flex: 1 }}>
              <strong>Registration Error</strong>
              <div style={{ fontSize: "13px", marginTop: "6px", opacity: 0.9 }}>
                {error}
              </div>
              {getErrorHint(error) && (
                <div style={{ fontSize: "12px", marginTop: "8px", opacity: 0.8, fontStyle: "italic" }}>
                  💡 {getErrorHint(error)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submission Error Display */}
        {validationErrors.submit && (
          <div className="auth-error">
            <div style={{ flex: 1 }}>
              <strong>Cannot Create Account</strong>
              <div style={{ fontSize: "13px", marginTop: "6px", opacity: 0.9 }}>
                {validationErrors.submit}
              </div>
              {getErrorHint(validationErrors.submit) && (
                <div style={{ fontSize: "12px", marginTop: "8px", opacity: 0.8, fontStyle: "italic" }}>
                  💡 {getErrorHint(validationErrors.submit)}
                </div>
              )}
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