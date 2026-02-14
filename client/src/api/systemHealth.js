/**
 * System Health Monitor
 * Monitors backend health and database connectivity
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const systemHealthAPI = {
  /**
   * Check system health - database, server, memory usage
   */
  checkHealth: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, {
        timeout: 5000 // 5 second timeout
      });
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      return {
        success: false,
        status: 'degraded',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Monitor health at regular intervals and trigger callback on changes
   */
  startHealthMonitoring: (intervalMs = 30000, onStatusChange = null) => {
    let lastStatus = 'unknown';
    
    const checkAndNotify = async () => {
      try {
        const health = await systemHealthAPI.checkHealth();
        const currentStatus = health.status;
        
        if (currentStatus !== lastStatus && onStatusChange) {
          console.log(`[HealthMonitor] Status changed: ${lastStatus} → ${currentStatus}`);
          onStatusChange({
            previousStatus: lastStatus,
            currentStatus: currentStatus,
            health: health
          });
        }
        
        lastStatus = currentStatus;
      } catch (error) {
        console.error('[HealthMonitor] Error checking health:', error);
      }
    };
    
    // Check immediately
    checkAndNotify();
    
    // Set up interval
    const intervalId = setInterval(checkAndNotify, intervalMs);
    
    // Return cleanup function
    return () => {
      clearInterval(intervalId);
    };
  },

  /**
   * Wait for system to become healthy with exponential backoff
   */
  waitForHealthy: async (maxWaitMs = 60000, onRetry = null) => {
    const startTime = Date.now();
    let retryCount = 0;
    const maxRetries = 10;
    
    while (Date.now() - startTime < maxWaitMs && retryCount < maxRetries) {
      try {
        const health = await systemHealthAPI.checkHealth();
        if (health.status === 'healthy') {
          console.log('[HealthMonitor] System is healthy!');
          return health;
        }
        
        // Calculate exponential backoff
        const delayMs = Math.min(1000 * Math.pow(2, retryCount), 10000);
        
        if (onRetry) {
          onRetry({
            retryCount: retryCount + 1,
            waitedMs: Date.now() - startTime,
            nextDelayMs: delayMs,
            health: health
          });
        }
        
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } catch (error) {
        console.error('[HealthMonitor] Error waiting for health:', error);
        
        const delayMs = Math.min(1000 * Math.pow(2, retryCount), 10000);
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    throw new Error('System did not become healthy within the timeout period');
  }
};

export default systemHealthAPI;
