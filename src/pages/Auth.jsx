import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState(""); // 🔐 tambahan untuk kunci rahasia
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login");

  const SECRET_KEY = import.meta.env.VITE_SECRET_KEY; // ambil dari .env

  const handleAuth = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email dan password wajib diisi!");
      return;
    }

    // Validasi password minimal 6 karakter saat daftar
    if (mode === "register" && password.length < 6) {
      toast.error("Password minimal 6 karakter!");
      return;
    }

    // Cek secret key saat daftar
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
    let result;

    try {
      if (mode === "login") {
        result = await supabase.auth.signInWithPassword({ email, password });
      } else {
        result = await supabase.auth.signUp({ email, password });
      }

      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success(mode === "login" ? "Berhasil masuk!" : "Berhasil mendaftar!");
        setTimeout(() => (window.location.href = "/dashboard"), 1200);
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan, coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <Toaster position="top-center" />

      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-xl font-semibold text-center mb-4">
          {mode === "login" ? "Masuk" : "Daftar"}
        </h2>

        <form onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-2 border rounded focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-4 border rounded focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Tambahan input untuk kunci rahasia hanya saat daftar */}
          {mode === "register" && (
            <input
              type="text"
              placeholder="Masukkan kunci rahasia"
              className="w-full p-2 mb-4 border rounded focus:ring-2 focus:ring-blue-400"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
            />
          )}

          <button
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-60"
          >
            {loading
              ? "Memproses..."
              : mode === "login"
                ? "Masuk"
                : "Daftar"}
          </button>
        </form>

        <p className="text-sm text-center mt-3">
          {mode === "login" ? (
            <>
              Belum punya akun?{" "}
              <span
                className="text-blue-500 cursor-pointer"
                onClick={() => setMode("register")}
              >
                Daftar
              </span>
            </>
          ) : (
            <>
              Sudah punya akun?{" "}
              <span
                className="text-blue-500 cursor-pointer"
                onClick={() => setMode("login")}
              >
                Masuk
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
