import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // import ikon mata

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login");
  const [resetMode, setResetMode] = useState(false);
  const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

  // State toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email dan password wajib diisi!");
      return;
    }
    if (mode === "register" && password.length < 6) {
      toast.error("Password minimal 6 karakter!");
      return;
    }
    if (mode === "register") {
      if (!secret) {
        toast.error("Kunci rahasia wajib diisi!");
        return;
      }
      if (secret !== SECRET_KEY) {
        toast.error("Kunci rahasia tidak valid!");
        return;
      }
    }
    setLoading(true);
    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Email sudah terdaftar, silakan masuk.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Pendaftaran berhasil! Silakan verifikasi email Anda.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (
            error.message.includes("Invalid login credentials") ||
            error.message.includes("Invalid email or password")
          ) {
            toast.error("Email atau password salah!");
          } else if (error.message.includes("Email not confirmed")) {
            toast.error("Email belum dikonfirmasi, periksa kotak masuk Anda.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Berhasil masuk!");
          setTimeout(() => (window.location.href = "/dashboard"), 1000);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan, coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Masukkan email terlebih dahulu!");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Link reset password telah dikirim ke email Anda.");
        setResetMode(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat mengirim link reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Toaster position="top-center" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md relative"
      >
        {!resetMode ? (
          <>
            {/* Header Tab */}
            <div className="flex mb-6 border-b">
              {["login", "register"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMode(tab)}
                  className={`flex-1 py-2 text-center font-semibold transition-all ${mode === tab
                    ? "border-b-4 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-blue-500"
                    }`}
                >
                  {tab === "login" ? "Masuk" : "Daftar"}
                </button>
              ))}
            </div>

            {/* Form Login / Register */}
            <form onSubmit={handleAuth} className="space-y-4">
              <input
                type="email"
                placeholder="Alamat Email"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* Input Password dengan toggle mata */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Kata Sandi"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {/* Ikon toggle */}
                <div
                  className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-gray-500" />
                  ) : (
                    <FaEye className="text-gray-500" />
                  )}
                </div>
              </div>

              <AnimatePresence>
                {mode === "register" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <input
                      type="text"
                      placeholder="Masukkan Kunci Rahasia"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      *Kunci rahasia hanya untuk pendaftar yang diizinkan admin
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60 font-medium"
              >
                {loading
                  ? "Memproses..."
                  : mode === "login"
                    ? "Masuk Sekarang"
                    : "Buat Akun"}
              </button>
            </form>
            {/* Footer */}
            <div className="text-sm text-center mt-4 text-gray-600 space-y-2">
              {mode === "login" && (
                <p
                  className="text-blue-500 cursor-pointer hover:underline"
                  onClick={() => setResetMode(true)}
                >
                  Lupa kata sandi?
                </p>
              )}

              {mode === "login" ? (
                <>
                  Belum punya akun?{" "}
                  <span
                    className="text-blue-500 cursor-pointer hover:underline"
                    onClick={() => setMode("register")}
                  >
                    Daftar
                  </span>
                </>
              ) : (
                <>
                  Sudah punya akun?{" "}
                  <span
                    className="text-blue-500 cursor-pointer hover:underline"
                    onClick={() => setMode("login")}
                  >
                    Masuk
                  </span>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            {/* 🔹 Reset Password Form */}
            <h2 className="text-xl font-semibold text-center mb-4">
              Reset Kata Sandi
            </h2>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                type="email"
                placeholder="Masukkan Email Anda"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60 font-medium"
              >
                {loading ? "Mengirim..." : "Kirim Link Reset"}
              </button>
            </form>
            <p
              className="text-sm text-center mt-4 text-blue-500 cursor-pointer hover:underline"
              onClick={() => setResetMode(false)}
            >
              Kembali ke login
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}