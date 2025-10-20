import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Heart, Sparkles } from "lucide-react";

const affirmations = [
  "Saya menggunakan uang dengan bijak dan penuh kesadaran.",
  "Setiap rupiah yang saya keluarkan membawa nilai dan kebahagiaan.",
  "Saya terbuka menerima kelimpahan dalam hidup saya.",
  "Saya mampu mengatur keuangan tanpa rasa takut atau stres.",
  "Saya layak untuk hidup sejahtera dan bebas secara finansial.",
  "Saya memilih untuk fokus pada kemajuan, bukan kesempurnaan.",
  "Saya bersyukur atas setiap rezeki, sekecil apa pun itu.",
  "Saya menarik peluang keuangan yang baik dengan energi positif.",
  "Saya mampu menyeimbangkan kebutuhan dan keinginan dengan tenang.",
  "Saya percaya bahwa uang adalah alat untuk menciptakan kehidupan yang bermakna.",
  "Saya berkembang bersama setiap keputusan finansial yang saya buat.",
  "Saya melepaskan rasa bersalah atas uang dan menggantinya dengan rasa syukur.",
  "Saya percaya pada proses saya menuju stabilitas dan kebebasan finansial.",
  "Saya belajar dari masa lalu dan tumbuh lebih bijak dalam mengelola uang.",
  "Saya adalah penentu arah keuangan dan masa depan saya sendiri.",
];

export default function AffirmationCard() {
  const [affirmation, setAffirmation] = useState("");

  useEffect(() => {
    generateAffirmation();
  }, []);

  const generateAffirmation = () => {
    const random =
      affirmations[Math.floor(Math.random() * affirmations.length)];
    setAffirmation(random);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-400 text-white p-6 rounded-2xl shadow-xl max-w-md mx-auto text-center relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-white/10 blur-2xl opacity-30 rounded-2xl" />

      {/* Icon atas */}
      <motion.div
        initial={{ rotate: -10, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex justify-center mb-4 relative z-10"
      >
        <Heart size={36} className="text-yellow-300" />
      </motion.div>

      {/* Afirmasi utama */}
      <motion.p
        key={affirmation}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-lg md:text-xl font-medium leading-relaxed relative z-10"
      >
        “{affirmation}”
      </motion.p>

      {/* Tombol ganti afirmasi */}
      <motion.button
        onClick={generateAffirmation}
        whileTap={{ scale: 0.95 }}
        className="mt-6 px-5 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold shadow-md transition backdrop-blur-sm relative z-10"
      >
        <Sparkles size={16} className="inline-block mr-2" />
        Afirmasi Baru
      </motion.button>
    </motion.div>
  );
}
