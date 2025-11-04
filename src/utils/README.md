# Utilities Documentation

This directory contains utility functions and helper modules for the MoneyMoo application.

## Available Utilities

### `cache.js`
Provides caching functionality:
- TTL-based cache with automatic expiration
- In-memory storage using Map
- Utility methods for cache management

### `errorHandler.js`
Centralized error handling:
- Input validation with configurable rules
- Error message formatting
- XSS prevention through input sanitization
- Context-aware error logging

### `formatters.js`
Data formatting utilities:
- Currency formatting (IDR)
- Date and time formatting
- File size formatting
- String sanitization
- Initials extraction from names

### `logger.js`
Application logging:
- Configurable log levels
- Console logging with metadata
- Audit trail for security events
- External logging service integration points

### `memoize.js`
Performance optimization:
- Function memoization
- TTL-based memoization
- Debounce and throttle utilities
- Cache statistics tracking

### `notifications.jsx`
User-facing notifications:
- Success, error, warning, and info toasts
- Confirmation dialogs
- Transaction-specific notifications

### `security.js`
Security utilities:
- Input sanitization
- URL validation
- Password strength validation
- Secure random string generation

## Utility Conventions

- Utilities are stateless where possible
- All utilities are exported as named or default exports
- Utilities handle their own errors gracefully
- Utilities are designed for reusability across components