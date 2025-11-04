# Pages Documentation

This directory contains route-level components for the MoneyMoo application.

## Available Pages

### `Auth.jsx`
Handles user authentication with login and registration forms

### `Dashboard.jsx`
Main dashboard displaying:
- Financial summary cards
- Transaction history
- Account balances
- Expense/income charts
- Transaction filtering and search

### `AddTransaction.jsx`
Form for adding new income or expense transactions

### `CategoriesPage.jsx`
Page for managing income and expense categories

### `UpdatePassword.jsx`
Page for updating user password after reset

### `Account.jsx`
User account management page

### `DebtPage.jsx`
Page for managing debts and loans

## Page Conventions

- Each page represents a route in the application
- Pages coordinate with multiple components to create full user experiences
- Pages handle their own data loading and error states
- Pages implement proper loading states for better UX