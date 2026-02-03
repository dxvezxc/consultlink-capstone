// CORS Configuration
// Handles Cross-Origin Resource Sharing for frontend-backend communication

const cors = require('cors');

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',     // Development
      'http://localhost:5000',      // Development
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      process.env.CLIENT_URL || 'https://vercel.app'  // Production (Vercel)
    ];
    
    if (!origin || allowedOrigins.some(allowed => origin.includes(allowed) || allowed.includes('vercel.app'))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 3600
};

module.exports = cors(corsOptions);
