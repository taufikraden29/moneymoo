import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Heart, Sparkles, RefreshCw, Quote } from "lucide-react";

const affirmations = [
  "Saya yakin bahwa rezeki saya telah ditetapkan oleh Allah dengan penuh keadilan.",
  "Saya mencari rezeki dengan cara yang halal dan penuh keberkahan.",
  "Saya percaya bahwa setiap usaha yang halal akan membawa kebaikan dunia dan akhirat.",
  "Saya bersyukur atas setiap rezeki, sekecil apa pun, karena itu tanda kasih sayang Allah.",
  "Saya yakin Allah akan mencukupkan kebutuhan saya sesuai janji-Nya dalam Al-Qur'an.",
  "Saya mengatur keuangan dengan amanah dan tanggung jawab sebagai bentuk ibadah.",
  // ... (sisanya tetap sama, untuk menghemat space)
];

export default function AffirmationCard() {
  const [affirmation, setAffirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previousAffirmations, setPreviousAffirmations] = useState([]);

  useEffect(() => {
    generateAffirmation();
  }, []);

  const generateAffirmation = async () => {
    if (isLoading) return;

    setIsLoading(true);

    // Filter out recent affirmations to avoid repetition
    const availableAffirmations = affirmations.filter(
      (aff) => !previousAffirmations.includes(aff)
    );

    const randomAffirmation =
      availableAffirmations.length > 0
        ? availableAffirmations[
            Math.floor(Math.random() * availableAffirmations.length)
          ]
        : affirmations[Math.floor(Math.random() * affirmations.length)];

    // Add to previous affirmations (keep only last 5)
    setPreviousAffirmations((prev) => [randomAffirmation, ...prev.slice(0, 4)]);

    // Simulate loading for better UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    setAffirmation(randomAffirmation);
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-400 text-white p-4 sm:p-6 rounded-2xl shadow-xl relative overflow-hidden min-h-[200px] flex flex-col justify-between">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />

        {/* Header with icon */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 relative z-10">
          <motion.div
            initial={{ rotate: -10, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <Heart size={20} className="text-yellow-300" />
            <span className="text-xs sm:text-sm font-semibold text-yellow-100">
              Afirmasi Keuangan Islami
            </span>
          </motion.div>

          <Quote size={16} className="text-white/60" />
        </div>

        {/* Affirmation text */}
        <div className="flex-1 flex items-center justify-center relative z-10 min-h-[80px] sm:min-h-[100px]">
          <AnimatePresence mode="wait">
            <motion.p
              key={affirmation}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 1.05 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="text-sm sm:text-base md:text-lg font-medium leading-relaxed text-center px-2 line-clamp-4"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 text-white/80">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <RefreshCw size={16} />
                  </motion.div>
                  Memuat afirmasi...
                </div>
              ) : (
                `"${affirmation}"`
              )}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Button */}
        <div className="flex justify-center mt-4 sm:mt-6 relative z-10">
          <motion.button
            onClick={generateAffirmation}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-white/20 hover:bg-white/30 disabled:bg-white/10 rounded-lg text-xs sm:text-sm font-semibold shadow-md transition-all backdrop-blur-sm border border-white/20 disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px] justify-center"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw size={14} />
              </motion.div>
            ) : (
              <Sparkles size={14} />
            )}
            {isLoading ? "Memuat..." : "Afirmasi Baru"}
          </motion.button>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1 mt-3 relative z-10">
          {[0, 1, 2, 3, 4].map((index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{
                scale: previousAffirmations.length > index ? 1 : 0.8,
                opacity: previousAffirmations.length > index ? 1 : 0.3,
              }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="w-1 h-1 bg-white/60 rounded-full"
            />
          ))}
        </div>
      </div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center mt-3"
      >
        <p className="text-xs text-gray-500">
          💡 Klik untuk motivasi keuangan Islami
        </p>
      </motion.div>
    </motion.div>
  );
}
