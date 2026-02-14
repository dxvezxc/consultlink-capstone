const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  // Get token from cookie (alternative method)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  console.log('=== PROTECT MIDDLEWARE ===');
  console.log('URL:', req.path);
  console.log('Token present:', !!token);
  if (token) console.log('Token (first 30 chars):', token.substring(0, 30) + '...');
  console.log('Auth header:', req.headers.authorization?.substring(0, 30) + (req.headers.authorization?.length > 30 ? '...' : ''));

  if (!token) {
    console.log('❌ NO TOKEN FOUND - Returning 401');
    return res.status(401).json({ 
      success: false, 
      error: 'Not authorized to access this route - no token found' 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded. User ID:', decoded.id);
    
    // Get user from database
    req.user = await User.findById(decoded.id).select('-password');
    console.log('✅ User found:', req.user?.email, 'Role:', req.user?.role);
    
    if (!req.user) {
      console.log('❌ USER NOT FOUND IN DATABASE');
      return res.status(401).json({ 
        success: false, 
        error: 'User no longer exists' 
      });
    }
    
    // Check if user is active
    if (!req.user.isActive) {
      console.log('❌ USER ACCOUNT IS DEACTIVATED');
      return res.status(401).json({ 
        success: false, 
        error: 'User account is deactivated' 
      });
    }
    
    // Update last login (optional)
    if (!req.user.lastLogin || Date.now() - req.user.lastLogin > 24 * 60 * 60 * 1000) {
      req.user.lastLogin = new Date();
      await req.user.save();
    }
    
    console.log('✅ PROTECT middleware passed');
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    console.error('Error type:', error.name);
    
    if (error.name === 'JsonWebTokenError') {
      console.log('❌ JWT ERROR - Invalid token');
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      console.log('❌ TOKEN EXPIRED');
      return res.status(401).json({ 
        success: false, 
        error: 'Token expired, please login again' 
      });
    }
    
    console.log('❌ UNKNOWN ERROR - Returning 401');
    return res.status(401).json({ 
      success: false, 
      error: 'Not authorized to access this route' 
    });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authorized' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user.role}' is not authorized to access this resource`
      });
    }
    
    next();
  };
};

module.exports = { protect, authorize };