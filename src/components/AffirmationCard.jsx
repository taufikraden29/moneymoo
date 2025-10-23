import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Heart, Sparkles } from "lucide-react";

const affirmations = [
  "Saya yakin bahwa rezeki saya telah ditetapkan oleh Allah dengan penuh keadilan.",
  "Saya mencari rezeki dengan cara yang halal dan penuh keberkahan.",
  "Saya percaya bahwa setiap usaha yang halal akan membawa kebaikan dunia dan akhirat.",
  "Saya bersyukur atas setiap rezeki, sekecil apa pun, karena itu tanda kasih sayang Allah.",
  "Saya yakin Allah akan mencukupkan kebutuhan saya sesuai janji-Nya dalam Al-Qur’an.",
  "Saya mengatur keuangan dengan amanah dan tanggung jawab sebagai bentuk ibadah.",
  "Saya menghindari hutang yang tidak perlu agar hidup saya lebih tenang dan berkah.",
  "Saya percaya bahwa keberkahan lebih utama daripada jumlah harta.",
  "Saya menafkahkan sebagian rezeki saya di jalan Allah dengan ikhlas.",
  "Saya yakin sedekah tidak mengurangi harta, melainkan melipatgandakannya.",
  "Saya berusaha jujur dalam setiap transaksi agar Allah memberkahi rezeki saya.",
  "Saya sabar dalam kesempitan dan bersyukur dalam kelapangan.",
  "Saya percaya bahwa rezeki datang dari arah yang tidak disangka-sangka.",
  "Saya tidak iri terhadap rezeki orang lain karena setiap orang punya takdir masing-masing.",
  "Saya berdoa agar rezeki saya membawa manfaat bagi banyak orang.",
  "Saya berusaha menabung untuk masa depan tanpa melupakan sedekah hari ini.",
  "Saya menjadikan uang sebagai alat untuk beribadah, bukan tujuan hidup.",
  "Saya yakin bahwa Allah Maha Pemberi Rezeki kepada hamba yang berusaha dan bertawakal.",
  "Saya menjaga keuangan dengan niat agar keluarga saya hidup dalam keberkahan.",
  "Saya menghindari riba karena saya ingin rezeki saya suci dan bersih.",
  "Saya percaya bahwa dengan bersyukur, Allah akan menambah nikmat saya.",
  "Saya yakin setiap pengeluaran yang diniatkan karena Allah akan diganti dengan kebaikan.",
  "Saya mengatur keuangan dengan niat agar tidak berlebih-lebihan, sesuai perintah Islam.",
  "Saya mencari peluang usaha yang halal dan bermanfaat bagi umat.",
  "Saya yakin bahwa rezeki saya datang bersama doa dan usaha yang sungguh-sungguh.",
  "Saya tenang karena Allah selalu bersama orang-orang yang sabar dan jujur.",
  "Saya tidak takut kekurangan, karena Allah adalah Ar-Razzaq, Maha Pemberi Rezeki.",
  "Saya menjauhi keserakahan dan mencukupkan diri dengan yang Allah berikan.",
  "Saya yakin bahwa keberhasilan sejati adalah ketika harta membawa ketenangan hati.",
  "Saya belajar mengelola harta agar bisa membantu sesama dan berbagi kebaikan.",
  "Saya percaya bahwa harta yang halal membawa ketenangan dan keberkahan.",
  "Saya bersyukur setiap kali Allah memberi rezeki yang tidak saya duga.",
  "Saya berdoa agar setiap uang yang saya keluarkan menjadi amal jariyah.",
  "Saya percaya bahwa Allah mencintai hamba yang bekerja keras dengan niat baik.",
  "Saya menjadikan keuangan saya sebagai sarana untuk menolong dan memberi manfaat.",
  "Saya yakin Allah melapangkan rezeki bagi hamba yang bersyukur dan berusaha.",
  "Saya menghindari pemborosan karena itu adalah sifat yang tidak disukai Allah.",
  "Saya memohon kepada Allah agar diberikan kecukupan yang menenangkan hati.",
  "Saya yakin bahwa kebahagiaan tidak hanya diukur dari banyaknya harta.",
  "Saya menjaga niat agar setiap usaha saya menjadi amal yang diridai Allah.",
  "Saya percaya bahwa setiap ujian keuangan adalah cara Allah mendekatkan saya kepada-Nya.",
  "Saya berusaha memperbaiki keuangan saya dengan ikhtiar dan doa yang sungguh-sungguh.",
  "Saya yakin Allah menggantikan setiap sedekah dengan pahala dan keberkahan.",
  "Saya berdoa agar rezeki saya membawa kebaikan bagi keluarga dan umat.",
  "Saya mengelola uang dengan disiplin karena itu bagian dari amanah.",
  "Saya yakin bahwa bekerja dengan jujur adalah bentuk ibadah yang tinggi nilainya.",
  "Saya memohon agar Allah menjaga hati saya dari cinta dunia yang berlebihan.",
  "Saya percaya bahwa rezeki terbaik adalah yang membawa ketenangan batin.",
  "Saya bersyukur atas setiap nikmat, karena dengan syukur hidup saya lebih tenang.",
  "Saya menjadikan keuangan sebagai alat untuk berbuat kebaikan dan menolong sesama.",
  "Saya yakin Allah tidak akan membebani saya di luar kemampuan saya.",
  "Saya berusaha menjaga keseimbangan antara dunia dan akhirat dalam pengelolaan harta.",
  "Saya percaya bahwa rezeki yang berkah akan cukup untuk semua kebutuhan.",
  "Saya mengatur keuangan dengan niat untuk mencapai kemandirian yang diridai Allah.",
  "Saya yakin bahwa dengan sabar dan tawakal, Allah akan melapangkan jalan rezeki saya.",
  "Saya bersyukur atas pekerjaan yang Allah titipkan sebagai jalan rezeki.",
  "Saya memohon agar setiap transaksi saya jauh dari tipu daya dan kerugian.",
  "Saya menjaga diri dari sifat boros agar rezeki saya tidak sia-sia.",
  "Saya yakin Allah memberikan rezeki di waktu yang paling tepat.",
  "Saya percaya bahwa keberlimpahan datang bersama kesyukuran dan keikhlasan.",
  "Saya berusaha menjadikan harta saya bermanfaat di dunia dan akhirat.",
  "Saya yakin bahwa setiap keputusan finansial yang baik adalah bentuk ibadah.",
  "Saya menjauhi kesombongan dan mengingat bahwa semua rezeki berasal dari Allah.",
  "Saya yakin Allah akan mengganti setiap pengorbanan dengan balasan yang lebih baik.",
  "Saya bersyukur karena Allah memberi kemampuan untuk mengelola rezeki dengan bijak.",
  "Saya percaya bahwa ketenangan hati lebih berharga daripada banyaknya harta.",
  "Saya berdoa agar Allah memberi saya rezeki yang halal, berkah, dan mencukupi.",
  "Saya yakin bahwa rezeki saya tidak akan tertukar dengan milik orang lain.",
  "Saya menanamkan niat agar harta saya menjadi jalan menuju kebaikan.",
  "Saya bersyukur atas setiap rezeki yang datang, karena itu bukti kasih Allah.",
  "Saya berusaha mengelola keuangan dengan adil dan penuh tanggung jawab.",
  "Saya percaya bahwa keberkahan datang ketika saya ikhlas memberi.",
  "Saya yakin bahwa Allah selalu membuka jalan bagi hamba yang berusaha dan berdoa.",
  "Saya memohon agar Allah memudahkan jalan saya dalam mencari rezeki yang baik.",
  "Saya berusaha menjadikan keuangan saya bersih dari riba dan kecurangan.",
  "Saya percaya bahwa setiap langkah kecil dalam kebaikan membawa keberkahan besar.",
  "Saya yakin bahwa rezeki saya tidak akan habis karena berbagi.",
  "Saya berusaha menjadi pribadi yang dermawan dan rendah hati.",
  "Saya bersyukur atas kecukupan yang membuat hidup saya tenang dan bahagia.",
  "Saya percaya bahwa Allah Maha Kaya dan memberi tanpa batas.",
  "Saya yakin bahwa keberhasilan finansial sejati adalah yang membawa saya lebih dekat kepada Allah.",
  "Saya memohon agar harta saya menjadi sarana untuk membantu orang lain.",
  "Saya menjaga keuangan keluarga dengan cinta dan tanggung jawab sesuai tuntunan Islam.",
  "Saya bersyukur karena Allah selalu mencukupkan kebutuhan saya tepat waktu.",
  "Saya yakin bahwa Allah menyiapkan rezeki terbaik untuk setiap hamba yang berserah diri.",
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
