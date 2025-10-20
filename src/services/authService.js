// src/services/authService.js
import { supabase } from "../lib/supabaseClient";

export async function registerUser(email, password, secret, SECRET_KEY) {
  if (!email || !password) throw new Error("Email dan password wajib diisi!");
  if (password.length < 6) throw new Error("Password minimal 6 karakter!");

  if (!secret) throw new Error("Kunci rahasia wajib diisi!");
  if (secret !== SECRET_KEY) throw new Error("Kunci rahasia tidak valid!");

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    if (error.message.includes("already registered")) {
      throw new Error("Email sudah terdaftar, silakan masuk.");
    } else {
      throw new Error(error.message);
    }
  }

  return "Pendaftaran berhasil! Silakan verifikasi email Anda.";
}

export async function loginUser(email, password) {
  if (!email || !password) throw new Error("Email dan password wajib diisi!");

  const { error } = await supabase.auth.signInWithPassword({
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
    } else {
      throw new Error(error.message);
    }
  }

  return "Berhasil masuk!";
}

export async function resetPassword(email) {
  if (!email) throw new Error("Masukkan email terlebih dahulu!");

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/update-password`,
  });

  if (error) throw new Error(error.message);
  return "Link reset password telah dikirim ke email Anda.";
}
