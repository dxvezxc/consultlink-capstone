import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

const Home = () => {
  // eslint-disable-next-line no-unused-vars
  const { user, login, register, error, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");

  // Login form state
  const [loginData, setLoginData] = useState({
    identifier: "",
    password: "",
    role: ""
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    studentID: "",
    password: "",
    confirmPassword: "",
    role: "student"
  });

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await login(loginData.identifier, loginData.password, loginData.role);
      
      if (result.success) {
        // Navigate to the appropriate dashboard based on role
        let dashboard = "/dashboard";
        if (result.data.user.role === "teacher") {
          dashboard = "/teacher-dashboard";
        } else if (result.data.user.role === "admin") {
          dashboard = "/admin-dashboard";
        }
        
        navigate(dashboard);
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      await register(registerData);
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  return (
    <>
      {/* HERO SECTION */}
      <section className="home-hero">
        <div className="hero-container">
          {/* LEFT CONTENT */}
          <div className="hero-text">
            <span className="hero-badge">
              Subject-Based Consultation System
            </span>

            <h1>
              Academic Consultations <br />
              Made <span>Smarter</span>
            </h1>

            <p>
              ConsultLink is a subject-based consultation appointment system
              designed for students and consultants at Philippine Women's
              College of Davao. Book, manage, and attend consultations with
              ease.
            </p>

            {/* BUTTONS BASED ON AUTH */}
            {user ? (
              <div className="hero-buttons">
                <Link to="/dashboard" className="btn-primary">
                  Go to Dashboard
                </Link>
              </div>
            ) : null}
          </div>

          {/* RIGHT CONTENT - LOGIN/REGISTER FORMS */}
          {!user && (
            <div className="hero-auth">
              <div className="auth-card">
                <div className="auth-tabs">
                  <button
                    className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
                    onClick={() => setActiveTab("login")}
                  >
                    Login
                  </button>
                  <button
                    className={`auth-tab ${activeTab === "register" ? "active" : ""}`}
                    onClick={() => setActiveTab("register")}
                  >
                    Register
                  </button>
                </div>

                {activeTab === "login" && (
                  <form className="auth-form" onSubmit={handleLogin}>
                    <h3>Welcome Back</h3>

                    <div className="form-group">
                      <label>Email or Student ID</label>
                      <input
                        type="text"
                        name="identifier"
                        value={loginData.identifier}
                        onChange={handleLoginChange}
                        required
                        placeholder="Enter email or student ID"
                      />
                    </div>

                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        name="password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        required
                        placeholder="Enter password"
                      />
                    </div>

                    <div className="form-group">
                      <label>Role</label>
                      <select
                        name="role"
                        value={loginData.role}
                        onChange={handleLoginChange}
                        required
                      >
                        <option value="">Select Role</option>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? "Logging in..." : "Login"}
                    </button>
                  </form>
                )}

                {activeTab === "register" && (
                  <form className="auth-form" onSubmit={handleRegister}>
                    <h3>Create Account</h3>

                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={registerData.name}
                        onChange={handleRegisterChange}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        required
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="form-group">
                      <label>Student ID (for students)</label>
                      <input
                        type="text"
                        name="studentID"
                        value={registerData.studentID}
                        onChange={handleRegisterChange}
                        placeholder="YY-XXXX-XXX format"
                      />
                    </div>

                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        name="password"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        required
                        placeholder="Create a password"
                      />
                    </div>

                    <div className="form-group">
                      <label>Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={registerData.confirmPassword}
                        onChange={handleRegisterChange}
                        required
                        placeholder="Confirm your password"
                      />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? "Creating Account..." : "Register"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features">
        <h2>Why Use ConsultLink?</h2>

        <div className="features-grid">
          <div className="feature-card">
            <h3>Subject-Based Booking</h3>
            <p>
              Students can book consultations based on specific academic
              subjects and areas of expertise.
            </p>
          </div>

          <div className="feature-card">
            <h3>Verified Consultants</h3>
            <p>
              Only authorized consultants and faculty members can accept and
              manage consultation requests.
            </p>
          </div>

          <div className="feature-card">
            <h3>Role-Based Dashboards</h3>
            <p>
              Separate dashboards for students, consultants, and administrators
              for efficient management.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;