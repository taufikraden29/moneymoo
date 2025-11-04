// src/utils/security.js
import logger from './logger';

/**
 * Security utility functions
 */
class SecurityUtils {
  /**
   * Sanitize user input to prevent XSS
   * @param {string} input - Input to sanitize
   * @returns {string} - Sanitized input
   */
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} - True if valid
   */
  static isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /**
   * Validate if value is a number
   * @param {*} value - Value to validate
   * @returns {boolean} - True if valid number
   */
  static isValidNumber(value) {
    return !isNaN(value) && isFinite(value) && Number(value) >= 0;
  }

  /**
   * Generate a cryptographically secure random string
   * @param {number} length - Length of the string
   * @returns {string} - Random string
   */
  static generateSecureRandomString(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Hash a value using SHA-256 (for non-sensitive data like IDs)
   * @param {string} value - Value to hash
   * @returns {Promise<string>} - Hashed value
   */
  static async hashValue(value) {
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Array} - Array of validation errors
   */
  static validatePasswordStrength(password) {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Password minimal 8 karakter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password harus mengandung huruf kapital');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password harus mengandung huruf kecil');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password harus mengandung angka');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password harus mengandung karakter spesial');
    }
    
    return errors;
  }

  /**
   * Check if a URL is safe for navigation
   * @param {string} url - URL to check
   * @returns {boolean} - True if safe
   */
  static isSafeUrl(url) {
    try {
      const parsedUrl = new URL(url, window.location.origin);
      return parsedUrl.origin === window.location.origin || parsedUrl.protocol === 'https:';
    } catch (e) {
      logger.warn(`Invalid URL detected: ${url}`, e);
      return false;
    }
  }

  /**
   * Escape HTML for safe display
   * @param {string} html - HTML string to escape
   * @returns {string} - Escaped HTML
   */
  static escapeHtml(html) {
    if (typeof html !== 'string') return html;
    
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  /**
   * Validate and sanitize a URL
   * @param {string} url - URL to validate
   * @returns {string|null} - Validated and sanitized URL or null if invalid
   */
  static validateAndSanitizeUrl(url) {
    if (!url) return null;
    
    try {
      const parsedUrl = new URL(url);
      
      // Only allow http/https protocols
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        logger.warn(`Blocked unsafe protocol in URL: ${url}`);
        return null;
      }
      
      // Return the sanitized URL
      return parsedUrl.toString();
    } catch (e) {
      logger.warn(`Invalid URL format: ${url}`, e);
      return null;
    }
  }
}

export default SecurityUtils;