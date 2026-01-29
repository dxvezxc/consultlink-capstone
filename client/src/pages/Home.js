import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const token = localStorage.getItem("token");

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
              designed for students and consultants at Philippine Women’s
              College of Davao. Book, manage, and attend consultations with
              ease.
            </p>

            {/* BUTTONS BASED ON AUTH */}
            {!token ? (
              <div className="hero-buttons">
                <Link to="/login" className="btn-primary">
                  Login
                </Link>
                <Link to="/register" className="btn-secondary">
                  Register
                </Link>
              </div>
            ) : (
              <div className="hero-buttons">
                <Link to="/dashboard" className="btn-primary">
                  Go to Dashboard
                </Link>
              </div>
            )}
          </div>

          {/* RIGHT CONTENT */}
          <div className="hero-visual">
            <div className="visual-card">
              <h3>Ongoing Consultation</h3>
              <p>Subject: Web Development</p>

              <div className="visual-footer">
                <span>Consultant Available</span>
                <div className="status-dot"></div>
              </div>
            </div>
          </div>
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