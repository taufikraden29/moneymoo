// src/utils/cache.js
import logger from './logger';

class Cache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
  }

  /**
   * Set a value in cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  set(key, value, ttl = this.defaultTTL) {
    this.cache.set(key, value);

    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }

    // Set expiration timer
    if (ttl > 0) {
      const timer = setTimeout(() => {
        this.delete(key);
        logger.debug(`Cache entry expired for key: ${key}`);
      }, ttl);
      this.timers.set(key, timer);
    }

    logger.debug(`Cached value for key: ${key}`);
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or undefined
   */
  get(key) {
    if (this.cache.has(key)) {
      logger.debug(`Cache hit for key: ${key}`);
      return this.cache.get(key);
    }
    logger.debug(`Cache miss for key: ${key}`);
    return undefined;
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {boolean} True if key exists
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Delete a value from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    logger.debug(`Removed cache entry for key: ${key}`);
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    logger.debug('Cleared all cache entries');
  }

  /**
   * Get cache size
   * @returns {number} Number of cached entries
   */
  size() {
    return this.cache.size;
  }

  /**
   * Get all cached keys
   * @returns {Array} Array of cached keys
   */
  keys() {
    return Array.from(this.cache.keys());
  }
}

// Create a singleton instance
const cache = new Cache();

export default cache;