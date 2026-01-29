// CORS Configuration
// Handles Cross-Origin Resource Sharing for frontend-backend communication

const cors = require('cors');

const corsOptions = {
  origin: [
    'http://localhost:3000',     // Development
    'http://localhost:5000',      // Development
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
    'https://yourdomain.com',     // Production
    'https://www.yourdomain.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 3600
};

module.exports = cors(corsOptions);
