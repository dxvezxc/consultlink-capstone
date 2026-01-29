const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, role, studentID } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, email, and password are required' 
      });
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Passwords do not match' 
      });
    }

    // Check if user exists by email
    const userByEmail = await User.findOne({ email: email.toLowerCase() });
    if (userByEmail) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email is already registered' 
      });
    }

    // Check if studentID exists (for students)
    if (studentID) {
      const studentIDExists = await User.findOne({ studentID });
      if (studentIDExists) {
        return res.status(400).json({ 
          success: false, 
          error: 'Student ID is already registered' 
        });
      }
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role: role || 'student',
      studentID: studentID || null,
      isActive: true
    });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create token
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subjects: user.subjects || [],
        studentID: user.studentID
      }
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        error: messages.join(', ') 
      });
    }

    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { identifier, password, role, email } = req.body;

    // Support both old (email) and new (identifier) formats
    const loginIdentifier = identifier || email;

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide login credentials'
      });
    }

    // Build query based on identifier type
    let query = {};
    
    // Check if identifier is an email
    if (loginIdentifier.includes('@')) {
      query.email = loginIdentifier.toLowerCase();
    }
    // Check if identifier looks like a student ID (format: XX-XXXX-XXX)
    else if (/^\d{2}-\d{4}-\d{3}$/.test(loginIdentifier)) {
      query.studentID = loginIdentifier;
    }
    // Otherwise, treat it as a name (for teachers/admin)
    else {
      query.name = new RegExp(`^${loginIdentifier.trim()}$`, 'i'); // Case-insensitive match
    }

    // If role is provided, add it to the query
    if (role) {
      query.role = role;
    }

    // Check for user
    const user = await User.findOne(query).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        error: 'Account has been deactivated' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create token
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subjects: user.subjects || [],
        studentID: user.studentID
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subjects: user.subjects || [],
        studentID: user.studentID,
        isActive: user.isActive,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user (invalidate token)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    // Token-based logout: client should delete the token
    // In a more robust system, you'd add the token to a blacklist
    
    res.json({
      success: true,
      message: 'Logout successful. Please delete the token from your client.'
    });
  } catch (error) {
    next(error);
  }
};
