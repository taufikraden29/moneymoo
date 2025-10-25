import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function AddTransaction() {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCategoryHint, setShowCategoryHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // 🔥 NEW: Prevent double submission

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    date: today,
    type: "expense",
    category: "",
    description: "",
    amount: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user;
      setUser(currentUser);
      if (currentUser) {
        await fetchCategories(currentUser.id);
      }
    };
    getSession();
  }, []);

  const fetchCategories = async (uid) => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    if (!error) setCategories(data || []);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "amount") {
      const numericValue = value.replace(/\D/g, "");
      const formatted = new Intl.NumberFormat("id-ID").format(numericValue);
      setForm({ ...form, [name]: formatted });
    } else {
      setForm({ ...form, [name]: value });

      // Show hint if no categories available for selected type
      if (name === "type") {
        const filteredCategories = categories.filter((c) => c.type === value);
        setShowCategoryHint(filteredCategories.length === 0);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 FIX: Prevent double submission
    if (isSubmitting || loading) {
      console.log("⚠️ Submission blocked: already submitting");
      return;
    }

    setLoading(true);
    setIsSubmitting(true);

    // 🔥 FIX: Better validation
    const validationErrors = [];
    if (!form.category) validationErrors.push("kategori");
    if (!form.amount || form.amount === "0") validationErrors.push("jumlah");
    if (!form.date) validationErrors.push("tanggal");

    if (validationErrors.length > 0) {
      toast.error(`⚠️ Isi kolom wajib: ${validationErrors.join(", ")}`);
      setLoading(false);
      setIsSubmitting(false);
      return;
    }

    const cleanAmount = Number(form.amount.replace(/\D/g, ""));

    if (cleanAmount === 0) {
      toast.error("⚠️ Jumlah transaksi tidak boleh nol!");
      setLoading(false);
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("📤 Submitting transaction...", {
        user_id: user?.id,
        ...form,
        amount: cleanAmount
      });

      // 🔥 FIX: Check for duplicate transaction
      const { data: existingTransaction } = await supabase
        .from("transactions")
        .select("id")
        .eq("user_id", user.id)
        .eq("amount", cleanAmount)
        .eq("description", form.description)
        .eq("category", form.category)
        .eq("date", form.date)
        .single();

      if (existingTransaction) {
        toast.error("❌ Transaksi dengan detail yang sama sudah ada!");
        setLoading(false);
        setIsSubmitting(false);
        return;
      }

      const { data, error } = await supabase
        .from("transactions")
        .insert([
          {
            user_id: user.id,
            date: form.date,
            type: form.type,
            category: form.category,
            description: form.description,
            amount: cleanAmount,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("❌ Supabase error:", error);
        throw error;
      }

      console.log("✅ Transaction created:", data);
      toast.success("✅ Transaksi berhasil ditambahkan!");

      // 🔥 FIX: Reset form immediately without setTimeout
      resetForm();

    } catch (error) {
      console.error("❌ Error adding transaction:", error);
      toast.error(`❌ Gagal menambahkan transaksi: ${error.message}`);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  // 🔥 NEW: Separate reset function
  const resetForm = () => {
    setForm({
      date: today,
      type: "expense",
      category: "",
      description: "",
      amount: "",
    });
  };

  // 🔥 NEW: Quick reset handler
  const handleReset = () => {
    resetForm();
    toast.success("🔄 Form berhasil direset!");
  };

  const filteredCategories = categories.filter((c) => c.type === form.type);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-6"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <span className="mr-2">←</span>
            Kembali ke Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            ➕ Tambah Transaksi
          </h1>
          <p className="text-gray-600 text-sm">
            Catat pemasukan dan pengeluaran Anda
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tanggal */}
            <div>
              <label className="block text-gray-700 mb-2 font-semibold text-sm">
                📅 Tanggal Transaksi
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                max={today}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Jenis Transaksi */}
            <div>
              <label className="block text-gray-700 mb-2 font-semibold text-sm">
                💰 Jenis Transaksi
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "income" })}
                  className={`py-3 px-4 rounded-xl border-2 transition-all duration-200 font-medium ${form.type === "income"
                      ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                    }`}
                >
                  💵 Pemasukan
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "expense" })}
                  className={`py-3 px-4 rounded-xl border-2 transition-all duration-200 font-medium ${form.type === "expense"
                      ? "border-red-500 bg-red-50 text-red-700 shadow-sm"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                    }`}
                >
                  🛍️ Pengeluaran
                </button>
              </div>
            </div>

            {/* Kategori */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-700 font-semibold text-sm">
                  📂 Kategori
                </label>
                {showCategoryHint && (
                  <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                    Belum ada kategori
                  </span>
                )}
              </div>

              <AnimatePresence mode="wait">
                <motion.select
                  key={form.type}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                  required
                >
                  <option value="">Pilih kategori...</option>
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </motion.select>
              </AnimatePresence>

              {filteredCategories.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg"
                >
                  💡 Belum ada kategori untuk {form.type === "income" ? "pemasukan" : "pengeluaran"}.
                  Tambahkan kategori terlebih dahulu di pengaturan.
                </motion.div>
              )}
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-gray-700 mb-2 font-semibold text-sm">
                📝 Deskripsi
              </label>
              <input
                type="text"
                name="description"
                placeholder={`Contoh: ${form.type === "income" ? "gaji bulanan, bonus, investasi" : "makan siang, belanja, transportasi"}`}
                value={form.description}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              />
            </div>

            {/* Jumlah */}
            <div>
              <label className="block text-gray-700 mb-2 font-semibold text-sm">
                💳 Jumlah (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  Rp
                </span>
                <input
                  type="text"
                  name="amount"
                  placeholder="0"
                  value={form.amount}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-right text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              {form.amount && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-gray-500 mt-2 text-right"
                >
                  Terbaca: <span className="font-mono">Rp {form.amount}</span>
                </motion.p>
              )}
            </div>

            {/* Preview Amount */}
            {form.amount && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-xl text-center font-bold text-lg ${form.type === "income"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                  }`}
              >
                {form.type === "income" ? "➕ Pemasukan" : "➖ Pengeluaran"}:
                <span className="font-mono ml-2">Rp {form.amount}</span>
              </motion.div>
            )}

            {/* 🔥 FIX: Better button state management */}
            <motion.button
              whileHover={!loading && !isSubmitting ? { scale: 1.02 } : {}}
              whileTap={!loading && !isSubmitting ? { scale: 0.98 } : {}}
              type="submit"
              disabled={loading || isSubmitting}
              className={`w-full py-4 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 ${loading || isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : form.type === "income"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {loading || isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Menyimpan...
                </div>
              ) : (
                `💾 Simpan Transaksi ${form.type === "income" ? "Pemasukan" : "Pengeluaran"}`
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="font-semibold text-gray-800 mb-4 text-center">
            ⚡ Aksi Cepat
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              📊 Dashboard
            </button>
            <button
              onClick={handleReset}
              disabled={loading || isSubmitting}
              className="py-3 px-4 bg-orange-100 hover:bg-orange-200 disabled:bg-gray-100 disabled:text-gray-400 rounded-xl text-orange-700 font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              🔄 Reset
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}