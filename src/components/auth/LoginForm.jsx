import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaArrowLeft,
} from "react-icons/fa";
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

    if (!email || !password) {
      toast.error("Harap isi semua field");
      return;
    }

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

    if (!email) {
      toast.error("Harap masukkan email Anda");
      return;
    }

    setLoading(true);
    try {
      const message = await resetPassword(email);
      toast.success(message);
      setResetMode(false);
      setEmail("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-md mx-auto overflow-hidden bg-white border border-gray-100 shadow-lg rounded-2xl"
      role="form"
      aria-label="Formulir login"
    >
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
            borderRadius: "12px",
            fontSize: "14px",
          },
        }}
      />

      <div className="p-8">
        {!resetMode ? (
          <>
            {/* Header */}
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                Selamat Datang
              </h2>
              <p className="mt-2 text-gray-600">Masuk ke akun Anda</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="login-email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <div
                    className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
                    aria-hidden="true"
                  >
                    <FaEnvelope className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="nama@email.com"
                    className="w-full py-3 pl-10 pr-4 transition-all duration-200 border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-describedby="email-help"
                  />
                </div>
                <p id="email-help" className="sr-only">Masukkan alamat email Anda</p>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setResetMode(true)}
                    className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                    aria-label="Lupa password? Klik untuk mereset password"
                  >
                    Lupa password?
                  </button>
                </div>
                <div className="relative">
                  <div
                    className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
                    aria-hidden="true"
                  >
                    <FaLock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    className="w-full py-3 pl-10 pr-12 transition-all duration-200 border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-describedby="password-help"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors rounded-md hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    <span className="sr-only">{showPassword ? "Sembunyikan password" : "Tampilkan password"}</span>
                    {showPassword ? (
                      <FaEyeSlash className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p id="password-help" className="sr-only">Masukkan password Anda</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-busy={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 mr-2 border-t-2 border-white border-solid rounded-full animate-spin" aria-hidden="true"></div>
                    <span>Memproses...</span>
                  </div>
                ) : (
                  "Masuk Sekarang"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Belum punya akun?{" "}
                <button
                  onClick={onSwitchToRegister}
                  className="font-semibold text-blue-600 transition-colors rounded-md hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Daftar akun baru"
                >
                  Daftar di sini
                </button>
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Reset Password Header */}
            <button
              onClick={() => setResetMode(false)}
              className="flex items-center p-1 mb-6 text-gray-600 transition-colors rounded-md hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Kembali ke formulir login"
            >
              <FaArrowLeft className="w-4 h-4 mr-2" />
              <span>Kembali</span>
            </button>

            <div className="mb-8 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full" aria-hidden="true">
                <FaLock className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Reset Password
              </h2>
              <p className="mt-2 text-gray-600">
                Masukkan email Anda untuk menerima link reset password
              </p>
            </div>

            {/* Reset Form */}
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="reset-email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <div
                    className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
                    aria-hidden="true"
                  >
                    <FaEnvelope className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="reset-email"
                    type="email"
                    placeholder="nama@email.com"
                    className="w-full py-3 pl-10 pr-4 transition-all duration-200 border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-describedby="reset-email-help"
                  />
                </div>
                <p id="reset-email-help" className="sr-only">Masukkan alamat email Anda untuk mereset password</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-busy={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 mr-2 border-t-2 border-white border-solid rounded-full animate-spin" aria-hidden="true"></div>
                    <span>Mengirim...</span>
                  </div>
                ) : (
                  "Kirim Link Reset"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  </div >
  );
}
