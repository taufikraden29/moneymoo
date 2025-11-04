// src/utils/memoize.js
import logger from './logger';

/**
 * Creates a memoized version of a function
 * @param {Function} fn - Function to memoize
 * @param {Function} resolver - Function to create cache key from arguments
 * @returns {Function} Memoized function
 */
export function memoize(fn, resolver) {
  if (typeof fn !== 'function' || (resolver && typeof resolver !== 'function')) {
    throw new Error('Expected a function');
  }

  const cache = new Map();
  const cacheInfo = {
    hits: 0,
    misses: 0
  };

  function memoized(...args) {
    const key = resolver ? resolver.apply(this, args) : args[0];
    
    if (cache.has(key)) {
      cacheInfo.hits++;
      logger.debug(`Memoization cache hit for key: ${key}`, { hits: cacheInfo.hits, misses: cacheInfo.misses });
      return cache.get(key);
    }
    
    cacheInfo.misses++;
    const result = fn.apply(this, args);
    cache.set(key, result);
    logger.debug(`Memoization cache miss for key: ${key}`, { hits: cacheInfo.hits, misses: cacheInfo.misses });
    return result;
  }
  
  memoized.cache = cache;
  memoized.cacheInfo = cacheInfo;
  memoized.clear = () => {
    cache.clear();
    cacheInfo.hits = 0;
    cacheInfo.misses = 0;
    logger.debug('Cleared memoization cache');
  };

  return memoized;
}

/**
 * Memoize with time-based expiration
 * @param {Function} fn - Function to memoize
 * @param {number} ttl - Time to live in milliseconds
 * @param {Function} resolver - Function to create cache key from arguments
 * @returns {Function} Memoized function with TTL
 */
export function memoizeWithTTL(fn, ttl = 5 * 60 * 1000, resolver) {
  if (typeof fn !== 'function' || (resolver && typeof resolver !== 'function')) {
    throw new Error('Expected a function');
  }

  const cache = new Map();
  const timers = new Map();
  const cacheInfo = {
    hits: 0,
    misses: 0
  };

  function memoized(...args) {
    const key = resolver ? resolver.apply(this, args) : args[0];
    
    if (cache.has(key)) {
      cacheInfo.hits++;
      logger.debug(`TTL Memoization cache hit for key: ${key}`, { hits: cacheInfo.hits, misses: cacheInfo.misses });
      return cache.get(key);
    }
    
    cacheInfo.misses++;
    const result = fn.apply(this, args);
    cache.set(key, result);
    
    // Set expiration timer
    const timer = setTimeout(() => {
      cache.delete(key);
      if (timers.has(key)) {
        timers.delete(key);
      }
      logger.debug(`TTL Memoization cache expired for key: ${key}`);
    }, ttl);
    
    timers.set(key, timer);
    logger.debug(`TTL Memoization cache miss for key: ${key}`, { hits: cacheInfo.hits, misses: cacheInfo.misses });
    return result;
  }

  memoized.cache = cache;
  memoized.cacheInfo = cacheInfo;
  memoized.clear = () => {
    cache.clear();
    timers.forEach(timer => clearTimeout(timer));
    timers.clear();
    cacheInfo.hits = 0;
    cacheInfo.misses = 0;
    logger.debug('Cleared TTL memoization cache');
  };

  return memoized;
}

/**
 * Debounce function to limit execution frequency
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Whether to execute immediately
 * @returns {Function} Debounced function
 */
export function debounce(func, wait, immediate = false) {
  let timeout;
  let result;

  function debounced(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) result = func.apply(this, args);
    };

    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) {
      result = func.apply(this, args);
      logger.debug('Debounced function executed immediately');
    }

    return result;
  }

  debounced.cancel = () => {
    clearTimeout(timeout);
    timeout = null;
    logger.debug('Debounced function cancelled');
  };

  return debounced;
}

/**
 * Throttle function to limit execution frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit time in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;

  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
      logger.debug('Throttled function executed');
    } else {
      logger.debug('Throttled function call ignored');
    }
  };
}