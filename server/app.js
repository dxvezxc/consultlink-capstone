const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import custom middleware
const errorHandler = require('./middleware/errorMiddleware');
const notFound = require('./middleware/notFoundMiddleware');
const requestTimeout = require('./middleware/timeoutMiddleware');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// CORS must be FIRST before other middleware
app.use(cors());

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting configuration - More intelligent handling
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased from 100 to 500 requests per windowMs to avoid false positives
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  trust: (req) => {
    // Trust Render proxy headers (check x-forwarded-for)
    return true;
  },
  skip: (req) => {
    // Skip rate limiting for health checks and static files
    if (req.path === '/api/health') return true;
    if (req.method === 'OPTIONS') return true; // Skip CORS preflight
    return false;
  },
  keyGenerator: (req, res) => {
    // Use x-forwarded-for if available, otherwise use IP
    return req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
  },
  // Custom handler for rate limit exceeded
  handler: (req, res, options) => {
    res.status(options.statusCode).json({
      success: false,
      status: 429,
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please wait before making more requests.',
      retryAfter: req.rateLimit?.resetTime,
      timestamp: new Date().toISOString()
    });
  },
});

// Separate, more liberal rate limiter for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // Higher limit for API routes
  skip: (req) => {
    // Skip for health checks and OPTIONS
    if (req.path === '/api/health') return true;
    if (req.method === 'OPTIONS') return true;
    return false;
  },
  keyGenerator: (req, res) => {
    return req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
  },
});

// Much stricter limiter for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 attempts per 15 minutes for auth
  skipSuccessfulRequests: true, // Don't count successful requests
  message: 'Too many login attempts, please try again later.',
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Request timeout middleware (30 seconds)
app.use(requestTimeout(30000));

// Connect to database
connectDB();

// Health check endpoint
app.get('/api/health', (req, res) => {
  const mongoHealth = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const statusCode = mongoHealth === 'connected' ? 200 : 503;
  
  res.status(statusCode).json({ 
    status: mongoHealth === 'connected' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoHealth,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
    }
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users')); // NEW: User management routes
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/availability', require('./routes/availability')); // NEW: Availability routes
app.use('/api/notifications', require('./routes/notifications')); // NEW: Notification routes
app.use('/api/admin', require('./routes/admin'));
app.use('/api/consultations', require('./routes/consultations')); // NEW: Consultation routes
app.use('/api/messages', require('./routes/messages')); // NEW: Message/Chat routes

// Request validation middleware to catch missing body/params
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON in request body'
    });
  }
  next(err);
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Serve React app for any unknown routes (send index.html for SPA routing)
  app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
} else {
  // Development route for testing
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Consultation Appointment System API',
      version: '1.0.0',
      environment: process.env.NODE_ENV,
      docs: '/api-docs'
    });
  });
}

// 404 Handler for API routes (must be after all other routes)
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Export the app for testing
module.exports = app;