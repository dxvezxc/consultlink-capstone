const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const router = express.Router();

// Student ID verification - accepts any valid format (YY-XXXX-XXX)
const verifyStudentID = (id) => {
  // Accept any student ID that matches the format YY-XXXX-XXX
  const idFormat = /^\d{2}-\d{4}-\d{3}$/;
  return idFormat.test(id);
};

// Enhanced error response helper
const errorResponse = (res, status, message) => {
  return res.status(status).json({ 
    success: false, 
    error: message 
  });
};

// REGISTER (with enhanced validation)
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, studentID, password, role } = req.body;
  
  // Validation
  if (!name || !email || !password) {
    return errorResponse(res, 400, 'Please provide name, email, and password');
  }
  
  // Student-specific validation
  if (role === 'student') {
    if (!studentID) return errorResponse(res, 400, 'Student ID required');
    if (!verifyStudentID(studentID)) {
      return errorResponse(res, 400, 'Invalid student ID');
    }
  }
  
  // Check if user exists by email OR studentID
  const existingUser = await User.findOne({ 
    $or: [{ email }, { studentID: studentID || '' }] 
  });
  
  if (existingUser) {
    const field = existingUser.email === email ? 'Email' : 'Student ID';
    return errorResponse(res, 400, `${field} already exists`);
  }
  
  // Create user with default role (password will be hashed by User model pre-save hook)
  const userData = {
    name,
    email,
    password, // Don't hash here - User model pre-save hook handles it
    role: role || 'student'
  };
  
  // Add studentID only if provided
  if (studentID) userData.studentID = studentID;
  
  const user = await User.create(userData);
  
  // Generate token (30 days expiry)
  const token = jwt.sign(
    { id: user._id, role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '30d' }
  );
  
  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;
  
  res.status(201).json({
    success: true,
    token,
    user: userResponse
  });
}));

// ENHANCED LOGIN (supports email or studentID)
router.post('/login', asyncHandler(async (req, res) => {
  const { identifier, password, role } = req.body;
  
  if (!identifier || !password) {
    return errorResponse(res, 400, 'Please provide identifier and password');
  }
  
  // Determine query based on identifier format
  let query;
  if (identifier.includes('@')) {
    query = { email: identifier.toLowerCase() };
  } else if (identifier.match(/^\d{2}-\d{4}-\d{3}$/)) {
    query = { studentID: identifier };
  } else {
    query = { name: identifier };
  }
  
  // Add role filter if provided
  if (role) query.role = role;
  
  // Find user with password (since it's normally excluded)
  const user = await User.findOne(query).select('+password');
  
  if (!user) {
    return errorResponse(res, 401, 'Invalid credentials');
  }
  
  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return errorResponse(res, 401, 'Invalid credentials');
  }
  
  // Generate token
  const token = jwt.sign(
    { id: user._id, role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '30d' }
  );
  
  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;
  
  res.json({
    success: true,
    token,
    user: userResponse
  });
}));

// GET CURRENT USER PROFILE (protected)
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    return errorResponse(res, 404, 'User not found');
  }
  res.json({
    success: true,
    user
  });
}));

// DEBUG: Get current authenticated user info
router.get('/whoami', protect, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      message: `You are logged in as ${req.user.name} (${req.user.role})`
    }
  });
}));

module.exports = router;