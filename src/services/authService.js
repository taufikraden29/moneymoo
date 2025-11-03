// src/services/authService.js
import { supabase } from "../lib/supabaseClient";

/**
 * Validasi email
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validasi password
 */
function validatePassword(password) {
  return password.length >= 6;
}

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
  // Validasi input
  if (!email || !password) throw new Error("Email dan password wajib diisi!");
  if (!validateEmail(email)) throw new Error("Format email tidak valid!");
  if (!validatePassword(password)) throw new Error("Password minimal 6 karakter!");
  if (!secret) throw new Error("Kunci rahasia wajib diisi!");
  if (secret !== SECRET_KEY) throw new Error("Kunci rahasia tidak valid!");
  if (!displayName) throw new Error("Nama pengguna wajib diisi!");
  if (displayName.trim().length < 2) throw new Error("Nama pengguna minimal 2 karakter!");

  try {
    // Mendaftarkan user ke Supabase + metadata nama
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName.trim(), // user_metadata field
        },
      },
    });

    if (error) {
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
          email: email,
          display_name: displayName.trim(),
          created_at: new Date().toISOString()
        }]);

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Jangan melempar error karena user tetap terdaftar meskipun profile gagal dibuat
      }
    }

    return "Pendaftaran berhasil! Silakan verifikasi email Anda.";
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

/**
 * Login user
 */
export async function loginUser(email, password) {
  if (!email || !password) throw new Error("Email dan password wajib diisi!");
  if (!validateEmail(email)) throw new Error("Format email tidak valid!");

  try {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
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

    return "Berhasil masuk!";
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Reset password
 */
export async function resetPassword(email) {
  if (!email) throw new Error("Masukkan email terlebih dahulu!");
  if (!validateEmail(email)) throw new Error("Format email tidak valid!");

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) throw error;
    return "Link reset password telah dikirim ke email Anda.";
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
}

/**
 * Update password setelah reset
 */
export async function updatePassword(newPassword) {
  if (!validatePassword(newPassword)) throw new Error("Password minimal 6 karakter!");
  
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    return "Password berhasil diperbarui!";
  } catch (error) {
    console.error('Update password error:', error);
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
    return "Berhasil keluar.";
  } catch (error) {
    console.error('Logout error:', error);
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
    console.error('Get user error:', error);
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
    console.error('Check session error:', error);
    throw error;
  }
}
