// Logger Utility
// Centralized logging system for the application

const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Get current timestamp
const getTimestamp = () => {
  return new Date().toISOString();
};

// Log levels
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
  SUCCESS: 'SUCCESS'
};

// Colors for console output
const COLORS = {
  ERROR: '\x1b[31m',    // Red
  WARN: '\x1b[33m',     // Yellow
  INFO: '\x1b[36m',     // Cyan
  DEBUG: '\x1b[35m',    // Magenta
  SUCCESS: '\x1b[32m',  // Green
  RESET: '\x1b[0m'      // Reset
};

class Logger {
  constructor(filename = 'app.log') {
    this.filename = path.join(logsDir, filename);
  }

  // Write to log file
  writeToFile(level, message, data = null) {
    try {
      const timestamp = getTimestamp();
      const logEntry = {
        timestamp,
        level,
        message,
        ...(data && { data })
      };

      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(this.filename, logLine);
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  // Console log with color
  consoleLog(level, message, data = null) {
    const color = COLORS[level] || COLORS.INFO;
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}] [${level}]`;

    if (data) {
      console.log(`${color}${prefix} ${message}${COLORS.RESET}`, data);
    } else {
      console.log(`${color}${prefix} ${message}${COLORS.RESET}`);
    }
  }

  // Log error
  error(message, error = null) {
    this.writeToFile(LOG_LEVELS.ERROR, message, error);
    this.consoleLog(LOG_LEVELS.ERROR, message, error);
  }

  // Log warning
  warn(message, data = null) {
    this.writeToFile(LOG_LEVELS.WARN, message, data);
    this.consoleLog(LOG_LEVELS.WARN, message, data);
  }

  // Log info
  info(message, data = null) {
    this.writeToFile(LOG_LEVELS.INFO, message, data);
    this.consoleLog(LOG_LEVELS.INFO, message, data);
  }

  // Log debug
  debug(message, data = null) {
    if (process.env.DEBUG === 'true') {
      this.writeToFile(LOG_LEVELS.DEBUG, message, data);
      this.consoleLog(LOG_LEVELS.DEBUG, message, data);
    }
  }

  // Log success
  success(message, data = null) {
    this.writeToFile(LOG_LEVELS.SUCCESS, message, data);
    this.consoleLog(LOG_LEVELS.SUCCESS, message, data);
  }

  // Log HTTP request
  logRequest(method, url, statusCode, duration) {
    const message = `${method} ${url} - ${statusCode} (${duration}ms)`;
    this.info(message);
  }

  // Log database operation
  logDatabase(operation, collection, duration) {
    const message = `Database ${operation} on ${collection} (${duration}ms)`;
    this.debug(message);
  }

  // Log authentication
  logAuth(action, userId, success) {
    const message = `Auth ${action} for user ${userId}: ${success ? 'success' : 'failed'}`;
    this.info(message);
  }

  // Clear old logs (older than specified days)
  clearOldLogs(daysToKeep = 7) {
    try {
      const files = fs.readdirSync(logsDir);
      const now = Date.now();
      const msPerDay = 24 * 60 * 60 * 1000;

      files.forEach(file => {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);
        const ageInDays = (now - stats.mtimeMs) / msPerDay;

        if (ageInDays > daysToKeep) {
          fs.unlinkSync(filePath);
          this.info(`Deleted old log file: ${file}`);
        }
      });
    } catch (error) {
      this.error('Error clearing old logs', error);
    }
  }
}

// Create default logger instance
const logger = new Logger('app.log');

module.exports = logger;
