// src/pages/Auth.jsx
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEye,
  FaEyeSlash,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import {
  registerUser,
  loginUser,
  resetPassword,
} from "../services/authService";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login");
  const [resetMode, setResetMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

  // Hero Slider
  const images = [
    "/public/Slide-1.webp",
    "/public/Slide-1.webp",
    "/public/Slide-1.webp",
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let message;
      if (mode === "register") {
        message = await registerUser(email, password, secret, SECRET_KEY);
      } else {
        message = await loginUser(email, password);
        setTimeout(() => (window.location.href = "/dashboard"), 1000);
      }
      toast.success(message);
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

  // UI
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-blue-50 to-indigo-100">
      <Toaster position="top-center" />

      {/* HERO */}
      <div className="relative w-full lg:w-1/2 h-64 lg:h-screen overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={images[currentSlide]}
            alt={`slide-${currentSlide}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center text-white p-6">
          <motion.h1
            key={currentSlide}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-3xl lg:text-4xl font-bold mb-2"
          >
            Selamat Datang di Portal Kami
          </motion.h1>
          <p className="text-sm lg:text-base text-gray-200 max-w-md">
            Akses dashboard eksklusif, kelola data, dan tingkatkan produktivitas
            Anda.
          </p>
        </div>

        {/* Navigasi slider */}
        <div className="absolute inset-0 flex items-center justify-between px-4">
          <button
            onClick={() =>
              setCurrentSlide((prev) =>
                prev === 0 ? images.length - 1 : prev - 1
              )
            }
            className="p-2 bg-white/30 rounded-full hover:bg-white/50 transition"
          >
            <FaChevronLeft className="text-white text-xl" />
          </button>
          <button
            onClick={() =>
              setCurrentSlide((prev) => (prev + 1) % images.length)
            }
            className="p-2 bg-white/30 rounded-full hover:bg-white/50 transition"
          >
            <FaChevronRight className="text-white text-xl" />
          </button>
        </div>
      </div>

      {/* FORM AUTH */}
      <div className="flex items-center justify-center w-full lg:w-1/2 px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md"
        >
          {!resetMode ? (
            <>
              {/* Tabs */}
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

              {/* Form */}
              <form onSubmit={handleAuth} className="space-y-4">
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
                        *Kunci rahasia hanya untuk pendaftar yang diizinkan
                        admin
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

              {/* Links */}
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
    </div>
  );
}
