/**
 * Format number to Indonesian Rupiah format
 * @param {number|string} number - The number to format
 * @returns {string} - Formatted currency string
 */
export const formatRupiah = (number) => {
  if (number === null || number === undefined || number === '') return '';
  
  // Convert to number if it's a string with formatting
  const cleanNumber = typeof number === 'string' ? 
    parseFloat(number.replace(/\D/g, '')) : 
    number;
    
  if (isNaN(cleanNumber)) return '';
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(cleanNumber);
};

/**
 * Format date to Indonesian format
 * @param {Date|string} date - The date to format
 * @param {string} format - The format type ('long', 'short', 'date-only')
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, format = 'long') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatDate:', date);
    return '';
  }
  
  const options = {
    'date-only': { day: '2-digit', month: 'short', year: 'numeric' },
    'short': { day: '2-digit', month: 'short' },
    'long': { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }
  };
  
  return dateObj.toLocaleDateString('id-ID', options[format] || options['long']);
};

/**
 * Format time to Indonesian format
 * @param {Date|string} time - The time to format
 * @returns {string} - Formatted time string
 */
export const formatTime = (time) => {
  if (!time) return '';
  
  const dateObj = new Date(time);
  
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid time provided to formatTime:', time);
    return '';
  }
  
  return dateObj.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format bytes to human readable format
 * @param {number} bytes - The number of bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted size string
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Sanitize string for safe display
 * @param {string} input - The string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Get initials from name
 * @param {string} name - The name to get initials from
 * @returns {string} - Initials
 */
export const getInitials = (name) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};