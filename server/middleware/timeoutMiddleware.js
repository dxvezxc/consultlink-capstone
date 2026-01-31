/**
 * Middleware to set request timeout
 * Prevents hanging requests that never complete
 */
const requestTimeout = (timeout = 30000) => {
  return (req, res, next) => {
    // Set a timeout for the request
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          error: 'Request timeout. Please try again later.',
          message: 'The server took too long to respond'
        });
      }
    }, timeout);

    // Clear the timeout if the request completes normally
    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  };
};

module.exports = requestTimeout;
