// src/utils/errorHandler.js
import { showErrorToast, showWarningToast } from './notifications';

/**
 * Centralized error handler for the application
 */
class ErrorHandler {
  /**
   * Log error to console and display user-friendly message
   * @param {Error|string} error - The error object or message
   * @param {string} context - Context where error occurred
   * @param {boolean} showAlert - Whether to show toast alert
   */
  static handle(error, context = '', showAlert = true) {
    // Extract error message
    const errorMessage = this.getErrorMessage(error);
    const fullContext = context ? `${context}: ${errorMessage}` : errorMessage;
    
    // Log to console for debugging
    console.error(`[ERROR] ${new Date().toISOString()} - ${fullContext}`, error);
    
    // Optional: send error to logging service (e.g., Sentry, LogRocket)
    this.sendToLoggingService(error, context);
    
    // Show user-friendly message
    if (showAlert) {
      showErrorToast(this.getUserFriendlyMessage(error));
    }
    
    return errorMessage;
  }
  
  /**
   * Get error message from error object or string
   * @param {Error|string} error 
   * @returns {string}
   */
  static getErrorMessage(error) {
    if (!error) return 'Unknown error occurred';
    
    if (typeof error === 'string') {
      return error;
    }
    
    if (error.message) {
      return error.message;
    }
    
    if (error.error_description) {
      return error.error_description;
    }
    
    if (error.error) {
      return error.error;
    }
    
    return 'Unknown error occurred';
  }
  
  /**
   * Convert error to user-friendly message
   * @param {Error|string} error 
   * @returns {string}
   */
  static getUserFriendlyMessage(error) {
    const message = this.getErrorMessage(error).toLowerCase();
    
    // Common error mappings
    if (message.includes('network error') || message.includes('fetch') || message.includes('connection')) {
      return 'Koneksi jaringan bermasalah. Silakan periksa koneksi internet Anda.';
    }
    
    if (message.includes('timeout')) {
      return 'Permintaan terlalu lama. Silakan coba lagi.';
    }
    
    if (message.includes('duplicate') || message.includes('unique constraint')) {
      return 'Data sudah ada sebelumnya. Silakan gunakan data yang berbeda.';
    }
    
    if (message.includes('forbidden') || message.includes('403')) {
      return 'Akses ditolak. Silakan coba login kembali.';
    }
    
    if (message.includes('unauthorized') || message.includes('401')) {
      return 'Sesi Anda telah habis. Silakan login kembali.';
    }
    
    if (message.includes('not found') || message.includes('404')) {
      return 'Data tidak ditemukan.';
    }
    
    return `Terjadi kesalahan: ${this.getErrorMessage(error)}`;
  }
  
  /**
   * Send error to external logging service
   * @param {Error|string} error 
   * @param {string} context 
   */
  static sendToLoggingService(error, context) {
    // In a real application, you would send this to a logging service like Sentry
    // Example: Sentry.captureException(error, { contexts: { context } });
    console.debug('[Logging Service]', { error, context, timestamp: new Date().toISOString() });
  }
  
  /**
   * Validate input data
   * @param {Object} data - Data to validate
   * @param {Object} rules - Validation rules
   * @returns {Array} - Array of validation errors
   */
  static validate(data, rules) {
    const errors = [];
    
    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field];
      
      // Required validation
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${this.formatFieldName(field)} wajib diisi`);
        continue;
      }
      
      // Skip other validations if field is empty and not required
      if (value === undefined || value === null || value === '') {
        continue;
      }
      
      // Type validation
      if (rule.type) {
        if (rule.type === 'email' && !this.isValidEmail(value)) {
          errors.push(`${this.formatFieldName(field)} harus berupa email yang valid`);
        }
        
        if (rule.type === 'number' && !this.isValidNumber(value)) {
          errors.push(`${this.formatFieldName(field)} harus berupa angka`);
        }
        
        if (rule.type === 'string' && typeof value !== 'string') {
          errors.push(`${this.formatFieldName(field)} harus berupa teks`);
        }
        
        if (rule.type === 'array' && !Array.isArray(value)) {
          errors.push(`${this.formatFieldName(field)} harus berupa daftar`);
        }
      }
      
      // Min length validation
      if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
        errors.push(`${this.formatFieldName(field)} minimal ${rule.minLength} karakter`);
      }
      
      // Max length validation
      if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
        errors.push(`${this.formatFieldName(field)} maksimal ${rule.maxLength} karakter`);
      }
      
      // Min value validation
      if (rule.min && typeof value === 'number' && value < rule.min) {
        errors.push(`${this.formatFieldName(field)} minimal ${rule.min}`);
      }
      
      // Max value validation
      if (rule.max && typeof value === 'number' && value > rule.max) {
        errors.push(`${this.formatFieldName(field)} maksimal ${rule.max}`);
      }
      
      // Custom validation
      if (rule.custom && typeof rule.custom === 'function') {
        const customError = rule.custom(value, data);
        if (customError) {
          errors.push(customError);
        }
      }
    }
    
    return errors;
  }
  
  /**
   * Format field name for display
   * @param {string} fieldName 
   * @returns {string}
   */
  static formatFieldName(fieldName) {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }
  
  /**
   * Validate email format
   * @param {string} email 
   * @returns {boolean}
   */
  static isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  /**
   * Validate if value is a valid number
   * @param {any} value 
   * @returns {boolean}
   */
  static isValidNumber(value) {
    return !isNaN(value) && isFinite(value) && Number(value) >= 0;
  }
  
  /**
   * Sanitize input to prevent XSS
   * @param {string} input 
   * @returns {string}
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
}

export default ErrorHandler;