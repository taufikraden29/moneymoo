import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { registerUser } from "../../services/authService";

export default function RegisterForm({ onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState(""); // 👈 tambahan
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 👇 pastikan registerUser menerima displayName
      const message = await registerUser(
        email,
        password,
        secret,
        SECRET_KEY,
        displayName
      );
      toast.success(message);
      setTimeout(() => onSwitchToLogin(), 1000);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <h2 className="text-2xl font-bold text-center mb-4 text-blue-600">
        Daftar Akun Baru
      </h2>

      <form onSubmit={handleRegister} className="space-y-4">
        {/* 👇 Tambahan untuk username/display name */}
        <input
          type="text"
          placeholder="Nama Lengkap / Username"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Alamat Email"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Kata Sandi"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60 font-medium"
        >
          {loading ? "Memproses..." : "Buat Akun"}
        </button>
      </form>

      <div className="text-sm text-center mt-4 text-gray-600">
        Sudah punya akun?{" "}
        <span
          className="text-blue-500 cursor-pointer hover:underline"
          onClick={onSwitchToLogin}
        >
          Masuk
        </span>
      </div>
    </>
  );
}
