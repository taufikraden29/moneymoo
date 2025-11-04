# Components Documentation

This directory contains all reusable UI components for the MoneyMoo application.

## Organization

Components are organized in two ways:
1. Feature-based directories (e.g., `Dashboard/`, `auth/`)
2. Standalone components (e.g., `AddTransactionModal.jsx`)

## Component Categories

### Dashboard Components (`Dashboard/`)
- `DashboardHeader.jsx` - Header section with user info and navigation
- `FinancialSummarySection.jsx` - Financial summary cards
- `FilterSection.jsx` - Transaction filtering UI
- `MobileNav.jsx` - Mobile navigation component
- `Pagination.jsx` - Pagination controls
- `TransactionList.jsx` - List of transactions organized by date

### Authentication Components (`auth/`)
- `AuthLayout.jsx` - Layout wrapper for auth pages
- `LoginForm.jsx` - User login form
- `RegisterForm.jsx` - User registration form

### Core Components
- `AccountModal.jsx` - Account management modal
- `AddTransactionModal.jsx` - Add transaction form modal
- `AffirmationCard.jsx` - Daily financial affirmation card
- `CategoryModal.jsx` - Category management modal
- `EditTransactionModal.jsx` - Edit transaction form modal
- `ReportChart.jsx` - Financial data visualization
- `StatusCardAccount.jsx` - Account status display card

## Component Conventions

- All components use PascalCase naming
- Components are exported as default exports
- Props are validated using JSDoc comments
- Components handle their own loading and error states where appropriate