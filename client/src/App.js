import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* Context Providers */
import { AuthProvider } from "./context/AuthContext";

/* Components */
import Navbar from "./components/Shared/Navbar";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

/* Pages */
import Home from "./pages/Home";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";

/* Dashboards */
import StudentDashboard from "./components/Dashboard/student/StudentDashboard";
import TeacherDashboard from "./components/Dashboard/teacher/TeacherDashboard";
import AdminDashboard from "./components/Dashboard/admin/AdminDashboard";

/* New Pages (to create) */
import Booking from "./pages/Booking";
import Appointments from "./pages/Appointments";
import Availability from "./pages/Availability";
import Debug from "./pages/Debug";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Student Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/booking" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Booking />
                </ProtectedRoute>
              } />
              <Route path="/appointments" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Appointments />
                </ProtectedRoute>
              } />
              
              {/* Protected Teacher Routes */}
              <Route path="/teacher-dashboard" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              } />
              <Route path="/availability" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <Availability />
                </ProtectedRoute>
              } />
              
              {/* Protected Admin Routes */}
              <Route path="/admin-dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              {/* Fallback Routes */}
              {/* Debug Route */}
              <Route path="/debug" element={<Debug />} />
              
              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          {/* Toast Notifications */}
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;