import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for handling automatic retry logic on errors
 * Implements exponential backoff and intelligent retry strategies
 */
export const useAutoRetry = () => {
  const retryTimeoutRef = useRef(null);
  
  /**
   * Execute an async function with automatic retry on retryable errors
   * @param {Function} asyncFn - The async function to execute
   * @param {Object} options - Configuration options
   * @returns {Promise} Result of the function or throws after max retries
   */
  const executeWithRetry = useCallback(async (
    asyncFn,
    {
      maxRetries = 3,
      initialDelay = 1000,
      backoffMultiplier = 2,
      maxDelay = 10000,
      onRetry = null,
      isRetryable = (error) => error.shouldRetry !== false && (error.status === 429 || error.status >= 500)
    } = {}
  ) => {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await asyncFn();
      } catch (error) {
        lastError = error;
        
        // Check if error is retryable
        if (!isRetryable(error) || attempt === maxRetries) {
          throw error;
        }
        
        // Calculate delay with exponential backoff
        const delayMs = Math.min(
          initialDelay * Math.pow(backoffMultiplier, attempt),
          maxDelay
        );
        
        // Add jitter to prevent thundering herd
        const jitter = Math.random() * 100;
        const totalDelay = delayMs + jitter;
        
        console.warn(
          `[useAutoRetry] Attempt ${attempt + 1}/${maxRetries} failed. ` +
          `Retrying in ${Math.round(totalDelay)}ms...`,
          error.message
        );
        
        // Call onRetry callback if provided
        if (onRetry) {
          onRetry({
            attempt: attempt + 1,
            error,
            nextRetryIn: totalDelay
          });
        }
        
        // Wait before retrying
        await new Promise((resolve) => {
          retryTimeoutRef.current = setTimeout(resolve, totalDelay);
        });
      }
    }
    
    throw lastError;
  }, []);
  
  /**
   * Cancel any pending retry
   */
  const cancelRetry = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRetry();
    };
  }, [cancelRetry]);
  
  return {
    executeWithRetry,
    cancelRetry
  };
};

/**
 * Higher-order function for wrapping async operations with retry logic
 */
export const withAutoRetry = (asyncFn, options = {}) => {
  return async (...args) => {
    const { executeWithRetry } = useAutoRetry();
    return executeWithRetry(() => asyncFn(...args), options);
  };
};

export default useAutoRetry;
