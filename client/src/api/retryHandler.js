/**
 * Retry handler with exponential backoff for API calls
 * Automatically retries failed requests with increasing delays
 */

/**
 * Retry an async function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Configuration options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.initialDelay - Initial delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 10000)
 * @param {Function} options.onRetry - Callback when retrying
 * @returns {Promise} Result of the function
 */
export const retryWithBackoff = async (
  fn,
  {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    onRetry = null,
  } = {}
) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on certain error types
      if (shouldNotRetry(error)) {
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(2, attempt),
        maxDelay
      );

      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.1 * delay;
      const totalDelay = delay + jitter;

      console.warn(
        `[RETRY] Attempt ${attempt + 1}/${maxRetries} failed. ` +
        `Retrying in ${Math.round(totalDelay)}ms...`,
        error.message
      );

      if (onRetry) {
        onRetry({ attempt, delay: totalDelay, error });
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, totalDelay));
    }
  }

  throw lastError;
};

/**
 * Determine if an error should not be retried
 */
const shouldNotRetry = (error) => {
  const status = error.status;

  // Don't retry on client errors (4xx) except for 408, 429, 503, 504
  if (status >= 400 && status < 500) {
    if (![408, 429, 503, 504].includes(status)) {
      return true;
    }
  }

  // Specific error codes that shouldn't be retried
  const nonRetryableErrors = [
    'auth_failed', // Authentication failed (wrong credentials)
    'validation', // Validation error
    'not_found', // 404 Not found
  ];

  if (
    error.data?.error &&
    nonRetryableErrors.includes(error.data.error)
  ) {
    return true;
  }

  return false;
};

/**
 * Wrapper to add retry logic to an API call
 * Usage: makeRetriableCall(authAPI.login, { email, password })
 */
export const makeRetriableCall = (apiFunction, params, options = {}) => {
  return retryWithBackoff(
    () => apiFunction(params),
    options
  );
};
