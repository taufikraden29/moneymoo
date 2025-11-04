import { createClient } from "@supabase/supabase-js";
import logger from "../utils/logger";

// Initialize Supabase client with security best practices
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log initialization for audit purposes
logger.audit('Supabase Client Initialized', { 
  timestamp: new Date().toISOString(),
  url: supabaseUrl 
});

// Create Supabase client with security configurations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable auto-refresh of tokens
    autoRefreshToken: true,
    // Persist sessions across browser tabs
    persistSession: true,
    // Detect and refresh expired sessions
    detectSessionInUrl: true,
    // Set session storage options
    storage: window.localStorage
  },
  global: {
    // Add security headers
    headers: {
      'X-Client-Type': 'Web-App',
      'X-Requested-With': 'XMLHttpRequest'
    }
  },
  db: {
    // Enable schema caching for performance while maintaining security
    schema: 'public'
  }
});

// Add security event listeners
supabase.auth.onAuthStateChange((event, session) => {
  logger.audit(`Auth State Changed: ${event}`, { 
    event,
    hasSession: !!session,
    timestamp: new Date().toISOString(),
    userId: session?.user?.id || null
  });
  
  if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
    // Additional security measures can be added here
    if (event === 'SIGNED_OUT') {
      logger.info('User signed out', { timestamp: new Date().toISOString() });
    }
  }
});
