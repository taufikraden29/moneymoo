# MoneyMoo - Personal Finance Tracker

MoneyMoo is a comprehensive personal finance management application built with React and Supabase. It helps users track their income and expenses, manage accounts, categorize transactions, and visualize their financial data.

## Features

### Core Functionality
- **User Authentication**: Secure login and registration with email verification
- **Transaction Management**: Add, edit, and delete income and expense transactions
- **Account Management**: Track multiple accounts (cash, bank, e-wallet, investment)
- **Category Management**: Organize transactions with custom categories
- **Financial Reporting**: Visual charts and summaries of financial data
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices

### Technical Features
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Input Validation**: Complete validation and sanitization of all inputs
- **Performance Optimization**: Caching, memoization, and efficient data loading
- **Security**: XSS protection, secure authentication, audit logging
- **Modular Architecture**: Well-organized code structure with clear separation of concerns

## Technology Stack

- **Frontend**: React 19 with hooks and modern patterns
- **Styling**: Tailwind CSS for utility-first styling
- **Database**: Supabase (PostgreSQL backend with real-time capabilities)
- **Routing**: React Router v6 for client-side navigation
- **State Management**: React hooks for local state, Supabase auth for global auth state
- **UI Components**: Headless UI, Framer Motion for animations
- **Charts**: Chart.js for financial data visualization
- **Build Tool**: Vite for fast development and builds

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Dashboard/       # Dashboard-specific components
│   ├── auth/            # Authentication components
│   └── ...              # Other component modules
├── hooks/              # Custom React hooks
├── lib/                # Library configurations (Supabase client)
├── pages/              # Route-level components
├── services/           # Business logic and API services
├── utils/              # Utility functions and helpers
├── App.jsx             # Main application component
└── main.jsx            # Entry point with routing
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Supabase account for database services

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd moneymoo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

## Development Guidelines

### Code Quality
- Follow ESLint and Prettier configurations for consistent code style
- Use descriptive names for variables, functions, and components
- Implement single responsibility principle for functions and components
- Write clean, maintainable, and well-documented code

### Security Best Practices
- All user inputs are validated and sanitized
- Implement proper authentication and authorization
- Use HTTPS for all API communications
- Store sensitive information in environment variables

### Performance Optimization
- Use memoization for expensive computations
- Implement efficient data fetching and caching strategies
- Optimize images and assets
- Implement proper loading states and error boundaries

### Testing
- Write unit tests for utility functions and custom hooks
- Implement integration tests for critical user flows
- Maintain high test coverage (70-80% minimum)

## API Documentation

The application uses Supabase for backend services. Key database tables include:

- `users`: User account information
- `transactions`: Financial transactions (income/expense)
- `accounts`: Financial accounts (cash, bank, e-wallet, etc.)
- `categories`: Transaction categories
- `profiles`: Extended user profile information

## Environment Variables

The application uses the following environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `REACT_APP_DEBUG`: Enable debug mode (optional)
- `REACT_APP_LOG_LEVEL`: Logging level (optional, default: info)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Standards and Requirements

The application follows these standards and requirements:

### Functional Requirements
- Features run according to specifications and user needs
- Complete input validation with proper formatting
- Consistent output according to standards (JSON, HTML, etc.)
- Error handling prevents crashes and provides informative messages
- Logging is implemented for debugging and auditing

### Code Quality
- Clean, tidy code consistent with conventions (linting/formatting)
- No code duplication (Don't Repeat Yourself / DRY)
- Modular structure with single responsibility functions
- Descriptive names for variables, functions, and components
- Technical documentation available (README, project structure, API explanation)

### Performance
- Fast and efficient response times
- Optimal algorithms, no unnecessary heavy loops
- Use caching or pagination for large data
- Efficient use of resources (CPU & memory)

### Security
- All inputs validated to prevent injection (SQL, XSS, etc.)
- Sensitive data encrypted or properly hashed (bcrypt, SHA256)
- Secure authentication & authorization system (JWT, OAuth, session-based)
- Inputs sanitized before processing
- All connections use HTTPS

### Maintainability
- Organized folder structure (components, hooks, utils, services, etc.)
- Comments only on important parts (not excessive)
- Unit tests and integration tests with 70-80% coverage minimum
- Automated CI/CD for build, test, and deploy
- Use Git with clear and meaningful commit messages

### Scalability & Portability
- Program can handle data and user growth
- Can run in various environments (local, staging, production)
- All configuration stored in environment variables (.env)
- Dependencies properly declared in config files (package.json, etc.)

### UI/UX
- Responsive design across screen sizes
- Intuitive navigation and easy to use
- Consistent color, font, and layout maintained
- Visual feedback (toast, loader, animations) available during actions
- Accessibility considered (high contrast, keyboard navigation, clear text)

## License

This project is licensed under the MIT License - see the LICENSE file for details.