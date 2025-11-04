# Hooks Documentation

This directory contains custom React hooks for the MoneyMoo application.

## Available Hooks

### `useTransactions`
Manages transaction-related state and operations including:
- Loading transactions with filters
- Adding new transactions
- Updating existing transactions
- Deleting transactions
- Calculating financial summaries

## Hook Conventions

- All hooks start with the `use` prefix
- Hooks encapsulate related logic and state
- Hooks return objects with methods and state values
- Hooks handle their own error states where appropriate