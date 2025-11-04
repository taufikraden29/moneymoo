# Services Documentation

This directory contains service modules that handle business logic and API interactions for the MoneyMoo application.

## Available Services

### `authService.js`
Handles all authentication-related operations:
- User registration and validation
- Login and logout
- Password reset functionality
- Session management

### `TransactionService.js`
Manages transaction-related operations:
- CRUD operations for transactions
- Financial summary calculations
- Account balance updates
- Data validation and sanitization

## Service Conventions

- Services contain pure business logic separate from UI concerns
- All async operations return promises
- Errors are properly handled and propagated to calling functions
- Input validation occurs at service level
- All user data is sanitized before being sent to APIs