const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  
  console.error(`[${timestamp}] Error:`, {
    message: err.message,
    code: err.code,
    name: err.name,
    path: req.path,
    method: req.method,
  });

  // Prevent headers already sent error
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

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
  if (err.name === 'MongoServerError') {
    statusCode = 503;
    message = 'Database connection error. Please try again later.';
  }

  // Timeout errors
  if (err.name === 'TimeoutError' || err.code === 'ECONNABORTED') {
    statusCode = 503;
    message = 'Request timeout. Please try again later.';
  }

  // Default error response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    timestamp,
  });
};

module.exports = errorHandler;
