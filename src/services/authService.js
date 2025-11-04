// src/services/authService.js
import { supabase } from "../lib/supabaseClient";
import ErrorHandler from "../utils/errorHandler";
import SecurityUtils from "../utils/security";
import logger from "../utils/logger";

/**
 * Register user baru dengan validasi dan metadata tambahan (displayName)
 */
export async function registerUser(
  email,
  password,
  secret,
  SECRET_KEY,
  displayName
) {
  // Validasi input menggunakan ErrorHandler dan SecurityUtils
  const validationErrors = ErrorHandler.validate(
    { email, password, secret, displayName },
    {
      email: { 
        required: true, 
        type: 'email',
        custom: (val) => !val ? null : (!SecurityUtils.isValidEmail(val) ? 'Format email tidak valid' : null)
      },
      password: { 
        required: true, 
        minLength: 8,
        custom: (val) => {
          if (!val) return null;
          const passwordErrors = SecurityUtils.validatePasswordStrength(val);
          return passwordErrors.length > 0 ? passwordErrors.join(', ') : null;
        }
      },
      secret: { required: true },
      displayName: { 
        required: true, 
        minLength: 2,
        custom: (val) => !val ? null : (val.trim().length < 2 ? 'Nama pengguna minimal 2 karakter' : null)
      }
    }
  );

  if (validationErrors.length > 0) {
    throw new Error(validationErrors[0]); // Return the first validation error
  }

  // Additional validation for secret key
  if (secret !== SECRET_KEY) {
    throw new Error("Kunci rahasia tidak valid!");
  }

  try {
    // Sanitasi input sebelum digunakan
    const sanitizedEmail = SecurityUtils.sanitizeInput(email);
    const sanitizedDisplayName = SecurityUtils.sanitizeInput(displayName.trim());
    
    // Log registration attempt for security monitoring
    logger.audit('Registration Attempt', { 
      email: sanitizedEmail, 
      timestamp: new Date().toISOString() 
    });

    // Mendaftarkan user ke Supabase + metadata nama
    const { error, data } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password,
      options: {
        data: {
          display_name: sanitizedDisplayName, // user_metadata field
        },
      },
    });

    if (error) {
      // Log failed registration
      logger.audit('Registration Failed', { 
        email: sanitizedEmail, 
        error: error.message,
        timestamp: new Date().toISOString() 
      });
      
      if (error.message.includes("already registered")) {
        throw new Error("Email sudah terdaftar, silakan masuk.");
      } else if (error.message.includes("validation")) {
        throw new Error("Format data tidak valid, harap periksa kembali.");
      } else {
        throw new Error(error.message);
      }
    }

    // Jika registrasi berhasil, buat akun default untuk user
    if (data?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          email: sanitizedEmail,
          display_name: sanitizedDisplayName,
          created_at: new Date().toISOString()
        }]);

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Jangan melempar error karena user tetap terdaftar meskipun profile gagal dibuat
      }
      
      // Log successful registration
      logger.audit('Registration Success', { 
        userId: data.user.id,
        email: sanitizedEmail, 
        timestamp: new Date().toISOString() 
      });
    }

    return "Pendaftaran berhasil! Silakan verifikasi email Anda.";
  } catch (error) {
    ErrorHandler.handle(error, 'Auth Service - Register');
    throw error;
  }
}

/**
 * Login user
 */
export async function loginUser(email, password) {
  // Validasi input
  const validationErrors = ErrorHandler.validate(
    { email, password },
    {
      email: { 
        required: true, 
        type: 'email',
        custom: (val) => !val ? null : (!SecurityUtils.isValidEmail(val) ? 'Format email tidak valid' : null)
      },
      password: { required: true }
    }
  );

  if (validationErrors.length > 0) {
    throw new Error(validationErrors[0]); // Return the first validation error
  }

  const sanitizedEmail = SecurityUtils.sanitizeInput(email);
  
  try {
    // Log login attempt for security monitoring
    logger.audit('Login Attempt', { 
      email: sanitizedEmail, 
      timestamp: new Date().toISOString() 
    });

    const { error, data } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password,
    });

    if (error) {
      // Log failed login attempt
      logger.audit('Login Failed', { 
        email: sanitizedEmail, 
        error: error.message,
        timestamp: new Date().toISOString() 
      });
      
      if (
        error.message.includes("Invalid login credentials") ||
        error.message.includes("Invalid email or password")
      ) {
        throw new Error("Email atau password salah!");
      } else if (error.message.includes("Email not confirmed")) {
        throw new Error("Email belum dikonfirmasi, periksa kotak masuk Anda.");
      } else if (error.message.includes("rate limit")) {
        throw new Error("Terlalu banyak percobaan login, coba lagi nanti.");
      } else {
        throw new Error(error.message);
      }
    }

    // Log successful login
    logger.audit('Login Success', { 
      userId: data.user?.id,
      email: sanitizedEmail, 
      timestamp: new Date().toISOString() 
    });

    return "Berhasil masuk!";
  } catch (error) {
    ErrorHandler.handle(error, 'Auth Service - Login');
    throw error;
  }
}

/**
 * Reset password
 */
export async function resetPassword(email) {
  // Validasi input
  const validationErrors = ErrorHandler.validate(
    { email },
    {
      email: { 
        required: true, 
        type: 'email',
        custom: (val) => !val ? null : (!SecurityUtils.isValidEmail(val) ? 'Format email tidak valid' : null)
      }
    }
  );

  if (validationErrors.length > 0) {
    throw new Error(validationErrors[0]); // Return the first validation error
  }

  const sanitizedEmail = SecurityUtils.sanitizeInput(email);
  
  try {
    // Log password reset attempt
    logger.audit('Password Reset Request', { 
      email: sanitizedEmail, 
      timestamp: new Date().toISOString() 
    });

    const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) throw error;
    return "Link reset password telah dikirim ke email Anda.";
  } catch (error) {
    ErrorHandler.handle(error, 'Auth Service - Password Reset');
    throw error;
  }
}

/**
 * Update password setelah reset
 */
export async function updatePassword(newPassword) {
  // Validasi password
  const validationErrors = ErrorHandler.validate(
    { password: newPassword },
    {
      password: { 
        required: true, 
        custom: (val) => {
          if (!val) return null;
          const passwordErrors = SecurityUtils.validatePasswordStrength(val);
          return passwordErrors.length > 0 ? passwordErrors.join(', ') : null;
        }
      }
    }
  );

  if (validationErrors.length > 0) {
    throw new Error(validationErrors[0]); // Return the first validation error
  }
  
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    return "Password berhasil diperbarui!";
  } catch (error) {
    ErrorHandler.handle(error, 'Auth Service - Update Password');
    throw error;
  }
}

/**
 * Logout user
 */
export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Log logout event
    logger.audit('User Logout', { 
      timestamp: new Date().toISOString() 
    });
    
    return "Berhasil keluar.";
  } catch (error) {
    ErrorHandler.handle(error, 'Auth Service - Logout');
    throw error;
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    ErrorHandler.handle(error, 'Auth Service - Get Current User');
    throw error;
  }
}

/**
 * Check session
 */
export async function checkSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    ErrorHandler.handle(error, 'Auth Service - Check Session');
    throw error;
  }
}
