import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function AuthLayout({ children }) {
  const images = [
    "https://i.imgur.com/RRRWyNr.png",
    "https://i.imgur.com/RRRWyNr.png",
    "https://i.imgur.com/RRRWyNr.png",
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-blue-50 to-indigo-100">
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

      {/* FORM WRAPPER */}
      <div className="flex items-center justify-center w-full lg:w-1/2 px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
