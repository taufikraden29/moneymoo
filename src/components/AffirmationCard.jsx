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
  "Keuangan saya semakin stabil setiap hari.",
  "Saya mampu menabung secara rutin dan disiplin.",
  "Saya menarik keberlimpahan tanpa batas ke dalam hidup saya.",
  "Saya percaya diri dalam membuat keputusan keuangan yang cerdas.",
  "Uang datang kepada saya dari berbagai sumber yang tak terduga.",
  "Saya layak mendapatkan kekayaan dan keberhasilan.",
  "Saya mampu mengatasi tantangan keuangan dengan tenang dan bijak.",
  "Saya bersyukur atas setiap peluang keuangan yang datang kepada saya.",
  "Saya mampu mengelola uang dengan penuh tanggung jawab.",
  "Keberhasilan finansial saya semakin nyata setiap hari.",
  "Saya menarik peluang investasi yang menguntungkan.",
  "Saya percaya bahwa saya pantas hidup makmur dan sejahtera.",
  "Saya mampu menciptakan aliran pendapatan pasif.",
  "Saya menikmati proses membangun kekayaan secara perlahan dan pasti.",
  "Saya berkomitmen terhadap keberhasilan keuangan saya.",
  "Saya layak menerima keberlimpahan tanpa rasa takut atau ragu.",
  "Saya mampu mengatasi rasa takut akan kekurangan uang.",
  "Saya memprioritaskan kebutuhan finansial utama saya.",
  "Saya bersyukur atas kekayaan yang saya miliki saat ini.",
  "Saya terbuka terhadap peluang baru yang mendukung keuangan saya.",
  "Saya menarik orang dan situasi yang mendukung kemakmuran saya.",
  "Saya mampu mengelola utang dengan bijak dan bertanggung jawab.",
  "Saya percaya bahwa uang adalah alat untuk membantu dan memberi manfaat.",
  "Saya merasa nyaman dan percaya diri dengan pengelolaan keuangan saya.",
  "Saya mampu mencapai tujuan keuangan saya dengan tekun.",
  "Saya menarik keberlimpahan dengan pikiran positif.",
  "Saya mampu mengatasi rasa takut gagal dalam keuangan.",
  "Saya layak mendapatkan kekayaan dan keberhasilan finansial.",
  "Saya percaya bahwa saya mampu menciptakan masa depan yang cerah.",
  "Saya terus belajar dan berkembang dalam mengelola uang.",
  "Saya mampu menyeimbangkan pengeluaran dan pemasukan dengan bijak.",
  "Saya menikmati proses mencapai kestabilan keuangan.",
  "Saya menarik peluang bisnis dan investasi yang menguntungkan.",
  "Saya mampu mengelola keuangan keluarga dengan penuh cinta dan tanggung jawab.",
  "Saya bersyukur atas setiap keberhasilan keuangan yang saya raih.",
  "Saya percaya pada kekuatan pikiran positif untuk menarik kekayaan.",
  "Saya mampu mengatasi hambatan keuangan dengan solusi kreatif.",
  "Saya layak mendapatkan keberlimpahan dan kemakmuran.",
  "Saya mampu mengelola keuangan secara efektif dan efisien.",
  "Saya menarik uang dengan mudah dan alami.",
  "Saya percaya bahwa kekayaan bukan hanya tentang uang, tetapi juga tentang kebahagiaan dan kesehatan.",
  "Saya mampu membangun kebiasaan finansial yang sehat.",
  "Saya bersyukur atas pengalaman dan pelajaran keuangan yang saya dapatkan.",
  "Saya mampu mengatur keuangan untuk masa depan saya dan keluarga.",
  "Saya percaya bahwa setiap langkah kecil membawa saya lebih dekat ke kebebasan finansial.",
  "Saya menarik peluang karier yang mendukung keuangan saya.",
  "Saya mampu menahan diri dari pengeluaran yang tidak perlu.",
  "Saya layak untuk hidup dalam keberlimpahan dan kemakmuran.",
  "Saya percaya bahwa kekayaan mengalir lancar ke dalam hidup saya.",
  "Saya mampu mengelola uang dengan penuh kedisiplinan.",
  "Saya menikmati proses menabung dan berinvestasi.",
  "Saya menarik keberhasilan finansial dengan energi positif dan keyakinan.",
  "Saya mampu mengatasi rasa takut kehilangan uang.",
  "Saya layak mendapatkan kekayaan dan keberhasilan yang berkelanjutan.",
  "Saya percaya bahwa saya mampu mencapai tujuan keuangan saya.",
  "Saya terus memperbaiki kebiasaan keuangan saya setiap hari.",
  "Saya menarik peluang usaha yang menguntungkan dan sesuai passion saya.",
  "Saya mampu mengelola keuangan dengan penuh rasa syukur dan cinta.",
  "Saya percaya bahwa kekayaan adalah hak saya yang pantas saya miliki.",
  "Saya mampu mengatasi hambatan keuangan dengan sikap positif.",
  "Saya menarik keberlimpahan dari sumber yang tidak terbatas.",
  "Saya mampu mengatur keuangan keluarga dengan penuh kasih dan tanggung jawab.",
  "Saya bersyukur atas kekayaan yang terus bertambah dalam hidup saya.",
  "Saya percaya bahwa masa depan keuangan saya penuh harapan dan keberhasilan.",
  "Saya mampu menjaga keuangan saya tetap sehat dan stabil.",
  "Saya menarik peluang investasi yang aman dan menguntungkan.",
  "Saya mampu mengelola pengeluaran dengan bijak dan disiplin.",
  "Saya layak menikmati keberlimpahan dan kemakmuran.",
  "Saya percaya bahwa uang adalah alat untuk mencapai kebahagiaan dan kedamaian.",
  "Saya mampu membangun kekayaan dari hal-hal kecil yang konsisten.",
  "Saya menarik sumber daya yang memudahkan saya mencapai tujuan keuangan.",
  "Saya mampu mengatasi rasa takut gagal dalam mencapai kekayaan.",
  "Saya layak mendapatkan keberhasilan finansial yang berkelanjutan.",
  "Saya percaya bahwa saya mampu menciptakan masa depan yang penuh keberlimpahan.",
  "Saya terus belajar dan beradaptasi dalam mengelola keuangan.",
  "Saya menarik keberhasilan dan kekayaan dengan pikiran positif.",
  "Saya mampu mengelola keuangan keluarga dengan penuh cinta dan tanggung jawab.",
  "Saya percaya bahwa kekayaan adalah hasil dari usaha dan keyakinan saya.",
  "Saya mampu mewujudkan impian keuangan saya dengan langkah kecil yang konsisten.",
  "Saya menarik peluang keuangan yang sesuai dengan nilai dan tujuan saya.",
  "Saya mampu mengatasi hambatan keuangan dengan rasa syukur dan solusi.",
  "Saya layak mendapatkan keberlimpahan dan kekayaan yang berkelanjutan.",
  "Saya percaya bahwa setiap hari adalah peluang baru untuk memperbaiki keuangan saya.",
  "Saya mampu menjaga keseimbangan antara pengeluaran dan pemasukan secara harmonis.",
  "Saya bersyukur atas perjalanan keuangan saya dan percaya akan masa depan yang cerah."
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
