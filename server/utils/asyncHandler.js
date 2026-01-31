/**
 * Wrapper function for async route handlers
 * Catches any errors and passes them to the error middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
