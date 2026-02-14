const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  
  console.error(`[${timestamp}] Error:`, {
    message: err.message,
    code: err.code,
    name: err.name,
    path: req.path,
    method: req.method,
    statusCode: err.statusCode,
  });

  // Prevent headers already sent error
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let shouldRetry = false;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern)[0];
    message = `Duplicate value for field: ${field}`;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Invalid resource ID format';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // MongoDB connection error
  if (err.name === 'MongoServerError' || err.name === 'MongoNetworkError') {
    statusCode = 503;
    message = 'Database connection error. Please try again later.';
    shouldRetry = true;
  }

  // Timeout errors
  if (err.name === 'TimeoutError' || err.code === 'ECONNABORTED') {
    statusCode = 503;
    message = 'Request timeout. Please try again later.';
    shouldRetry = true;
  }

  // Rate limiting error (from express-rate-limit)
  if (err.status === 429 || statusCode === 429) {
    statusCode = 429;
    message = 'Too many requests. Please wait before making more requests.';
    shouldRetry = true;
    
    // Return specific rate limit info
    return res.status(429).json({
      success: false,
      status: 429,
      error: 'rate_limited',
      message: message,
      retryAfter: 60, // Suggest retry after 60 seconds
      timestamp,
      shouldRetry: true
    });
  }

  // Handle operational errors (known errors)
  const isOperationalError = err.isOperational === true;

  // Default error response
  const response = {
    success: false,
    status: statusCode,
    error: message,
    timestamp,
    shouldRetry: shouldRetry || (statusCode >= 500 && statusCode < 600)
  };

  // Add debug info in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.details = err;
  }

  // Add retry suggestion for specific errors
  if (shouldRetry) {
    response.retryAfter = 1000; // Suggest retry after 1 second
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
