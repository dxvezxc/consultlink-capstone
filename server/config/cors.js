// CORS Configuration
// Handles Cross-Origin Resource Sharing for frontend-backend communication

const cors = require('cors');

const corsOptions = {
  origin: true, // Allow all origins in development/production
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 3600
};

module.exports = cors(corsOptions);
