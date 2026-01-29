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

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Auto-focus the identifier field when role is selected
  useEffect(() => {
    if (role && !identifier) {
      document.getElementById("identifier-input")?.focus();
    }
  }, [role, identifier]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!role) {
      alert("Please select a role.");
      return;
    }

    console.log('Submitting login form...');
    const result = await login(identifier, password, role);
    console.log('Login result:', result);
    
    if (result.success) {
      // Navigate to the appropriate dashboard
      let dashboard = "/dashboard";
      if (result.data.user.role === "teacher") {
        dashboard = "/teacher-dashboard";
      } else if (result.data.user.role === "admin") {
        dashboard = "/admin-dashboard";
      }

      console.log('Navigating to:', from || dashboard);
      // Use the redirect path if available, otherwise go to dashboard
      navigate(from || dashboard, { replace: true });
    } else {
      console.error('Login failed:', result.error);
    }
  };

  // Handle input changes with error clearing
  const handleIdentifierChange = (e) => {
    setIdentifier(e.target.value);
    if (error) clearError();
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) clearError();
  };

  // Get placeholder based on role
  const getIdentifierPlaceholder = () => {
    switch (role) {
      case "student":
        return "e.g., 12-1234-123 or email@example.com";
      case "teacher":
        return "e.g., Dr. Smith or email@example.com";
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

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h2>Login to Consultation System</h2>

        {/* Error Display */}
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
              <strong>Login Failed!</strong>
              <div style={{fontSize: "13px", marginTop: "4px", color: "#a00"}}>
                {error.toLowerCase().includes('invalid credentials') 
                  ? "Please check your login information and try again. Make sure you selected the correct user type." 
                  : error}
              </div>
            </div>
          </div>
        )}

        {/* Role Selection */}
        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label>User Type</label>
          <select
            value={role}
            onChange={(e) => {
              console.log('Role selected:', e.target.value);
              setRole(e.target.value);
              setIdentifier(""); // Clear identifier when role changes
              clearError();
            }}
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "2px solid #e2e8f0",
              fontSize: "16px",
              backgroundColor: loading ? "#f7fafc" : "white"
            }}
          >
            <option value="">-- Select Role --</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {role && (
          <form onSubmit={handleSubmit}>
            {/* Identifier Field */}
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label>{getIdentifierLabel()}</label>
              <input
                id="identifier-input"
                type="text"
                placeholder={getIdentifierPlaceholder()}
                value={identifier}
                onChange={handleIdentifierChange}
                required
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: error ? "2px solid #f99" : "2px solid #e2e8f0",
                  fontSize: "16px",
                  backgroundColor: loading ? "#f7fafc" : "white",
                  transition: "border-color 0.2s"
                }}
              />
            </div>

            {/* Password Field */}
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                required
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: error ? "2px solid #f99" : "2px solid #e2e8f0",
                  fontSize: "16px",
                  backgroundColor: loading ? "#f7fafc" : "white",
                  transition: "border-color 0.2s"
                }}
              />
              {error && (
                <small style={{
                  color: "#c00",
                  marginTop: "4px",
                  display: "block",
                  fontSize: "12px"
                }}>
                  💡 Tip: Check your password and try again
                </small>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading || !identifier || !password}
              style={{
                width: "100%",
                padding: "12px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px"
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: "18px",
                    height: "18px",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "50%",
                    borderTopColor: "white",
                    animation: "spin 1s ease-in-out infinite"
                  }}></span>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
        )}

        {/* Links */}
        <div className="auth-link" style={{ marginTop: "20px", textAlign: "center" }}>
          <p style={{ marginBottom: "10px" }}>
            <Link to="/register" style={{ color: "#667eea", textDecoration: "none" }}>
              Create a student account →
            </Link>
          </p>
          <p>
            <Link to="/forgot-password" style={{ color: "#667eea", textDecoration: "none" }}>
              Forgot your password?
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div style={{
          marginTop: "30px",
          padding: "15px",
          background: "#f7fafc",
          borderRadius: "8px",
          borderLeft: "4px solid #667eea",
          fontSize: "14px"
        }}>
          <p style={{ fontWeight: "600", marginBottom: "8px", color: "#555" }}>
            Demo Credentials:
          </p>
          <ul style={{ listStyle: "none", padding: "0", margin: "0", color: "#666" }}>
            <li style={{ margin: "5px 0", paddingLeft: "15px", position: "relative" }}>
              <span style={{ position: "absolute", left: "0", color: "#667eea" }}>•</span>
              <strong>Student:</strong> 12-1234-123 / Student@123
            </li>
            <li style={{ margin: "5px 0", paddingLeft: "15px", position: "relative" }}>
              <span style={{ position: "absolute", left: "0", color: "#667eea" }}>•</span>
              <strong>Teacher:</strong> Dr. Smith / Teacher@123
            </li>
            <li style={{ margin: "5px 0", paddingLeft: "15px", position: "relative" }}>
              <span style={{ position: "absolute", left: "0", color: "#667eea" }}>•</span>
              <strong>Admin:</strong> admin@consultlink.local / Admin@123
            </li>
          </ul>
        </div>
      </div>

      {/* Add CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;