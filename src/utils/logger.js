// src/utils/logger.js
import { showInfoToast } from './notifications';

class Logger {
  constructor() {
    // Use import.meta.env instead of process.env for Vite environment variables
    this.isEnabled = import.meta.env.MODE === 'development' || import.meta.env.VITE_DEBUG === 'true' || import.meta.env.REACT_APP_DEBUG === 'true';
    this.level = import.meta.env.VITE_LOG_LEVEL || import.meta.env.REACT_APP_LOG_LEVEL || 'info';
  }

  /**
   * Log message with specified level
   * @param {string} level - The log level (debug, info, warn, error)
   * @param {string} message - The message to log
   * @param {any} data - Optional data to log
   */
  log(level, message, data = null) {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data: data || null
    };

    // Always log to console for debugging purposes
    switch (level) {
      case 'error':
        console.error(`[ERROR] ${timestamp} - ${message}`, data);
        break;
      case 'warn':
        console.warn(`[WARN] ${timestamp} - ${message}`, data);
        break;
      case 'debug':
        console.debug(`[DEBUG] ${timestamp} - ${message}`, data);
        break;
      default:
        console.log(`[${level.toUpperCase()}] ${timestamp} - ${message}`, data);
    }

    // Optional: send to external logging service
    this.sendToExternalLogger(logEntry);
  }

  /**
   * Check if the current log level should be logged
   * @param {string} level - The log level to check
   * @returns {boolean}
   */
  shouldLog(level) {
    if (!this.isEnabled) return false;

    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= levels[this.level];
  }

  /**
   * Send log to external logging service
   * @param {Object} logEntry - The log entry to send
   */
  sendToExternalLogger(logEntry) {
    // In a real application, you could send log to external services like:
    // - Sentry
    // - LogRocket
    // - Custom logging API
    // Example: 
    // if (import.meta.env.VITE_LOGGING_SERVICE_URL) {
    //   fetch(import.meta.env.VITE_LOGGING_SERVICE_URL, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(logEntry)
    //   }).catch(err => console.error('Failed to send log to external service:', err));
    // }
  }

  /**
   * Debug level logging
   * @param {string} message - The message to log
   * @param {any} data - Optional data to log
   */
  debug(message, data) {
    this.log('debug', message, data);
  }

  /**
   * Info level logging
   * @param {string} message - The message to log
   * @param {any} data - Optional data to log
   */
  info(message, data) {
    this.log('info', message, data);
  }

  /**
   * Warning level logging
   * @param {string} message - The message to log
   * @param {any} data - Optional data to log
   */
  warn(message, data) {
    this.log('warn', message, data);
  }

  /**
   * Error level logging
   * @param {string} message - The message to log
   * @param {any} data - Optional data to log
   */
  error(message, data) {
    this.log('error', message, data);
  }

  /**
   * Log application events for audit purposes
   * @param {string} event - The event name
   * @param {Object} details - Event details
   */
  audit(event, details = {}) {
    if (!this.isEnabled) return;

    const auditEntry = {
      ...details,
      event,
      timestamp: new Date().toISOString(),
      userId: details.userId || null,
      page: window.location.pathname,
      userAgent: navigator.userAgent
    };

    console.log(`[AUDIT] ${event}`, auditEntry);

    // Add to local audit log storage
    this.logToStorage('audit', event, auditEntry);

    // In a real application, this would be sent to an audit logging system
  }

  /**
   * Log message to local storage for the log page
   * @param {string} type - The log type
   * @param {string} message - The message to log
   * @param {Object} details - Additional details
   */
  logToStorage(type, message, details = {}) {
    if (!this.isEnabled) return;

    // Add directly to localStorage using the same format as LogService
    try {
      const LOG_STORAGE_KEY = 'money_moo_audit_logs';
      const MAX_LOGS = 1000;
      
      const logsStr = localStorage.getItem(LOG_STORAGE_KEY);
      const logs = logsStr ? JSON.parse(logsStr) : [];
      
      logs.push({
        id: Date.now() + Math.random(),
        event: message,
        details: {
          ...details,
          timestamp: new Date().toISOString(),
          page: window.location.pathname,
          userAgent: navigator.userAgent
        }
      });
      
      // Keep only the latest logs to prevent storage overflow
      if (logs.length > MAX_LOGS) {
        logs.shift();
      }
      
      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.warn('Failed to save log to localStorage:', e);
    }
  }

  /**
   * Enable logging
   */
  enable() {
    this.isEnabled = true;
  }

  /**
   * Disable logging
   */
  disable() {
    this.isEnabled = false;
  }
}

// Create a singleton instance
const logger = new Logger();

export default logger;