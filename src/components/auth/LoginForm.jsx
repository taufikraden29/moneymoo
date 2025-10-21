import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { loginUser, resetPassword } from "../../services/authService";

export default function LoginForm({ onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  const togglePasswordVisibility = () => setShowPassword((p) => !p);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const message = await loginUser(email, password);
      toast.success(message);
      setTimeout(() => (window.location.href = "/dashboard"), 1000);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const message = await resetPassword(email);
      toast.success(message);
      setResetMode(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      {!resetMode ? (
        <>
          <h2 className="text-2xl font-bold text-center mb-4 text-blue-600">
            Masuk ke Akun
          </h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Alamat Email"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Kata Sandi"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60 font-medium"
            >
              {loading ? "Memproses..." : "Masuk Sekarang"}
            </button>
          </form>

          <div className="text-sm text-center mt-4 text-gray-600 space-y-2">
            <p
              className="text-blue-500 cursor-pointer hover:underline"
              onClick={() => setResetMode(true)}
            >
              Lupa kata sandi?
            </p>
            <p>
              Belum punya akun?{" "}
              <span
                className="text-blue-500 cursor-pointer hover:underline"
                onClick={onSwitchToRegister}
              >
                Daftar
              </span>
            </p>
          </div>
        </>
      ) : (
        <>
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
    </>
  );
}
