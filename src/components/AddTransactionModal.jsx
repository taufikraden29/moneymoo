import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";

const AddTransactionModal = ({ open, onClose, onAdd, categories, accounts }) => {
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "expense",
    category: "",
    description: "",
    amount: "",
    account_id: ""
  });
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setForm({
        date: new Date().toISOString().split("T")[0],
        type: "expense",
        category: "",
        description: "",
        amount: "",
        account_id: ""
      });
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "amount") {
      const numericValue = value.replace(/\D/g, "");
      const formatted = new Intl.NumberFormat("id-ID").format(numericValue);
      setForm({ ...form, [name]: formatted });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 FIX: Prevent double submission
    if (isSubmitting || loading) {
      console.log("⚠️ Modal submission blocked: already submitting");
      return;
    }

    setLoading(true);
    setIsSubmitting(true);

    // Validation
    if (!form.category || !form.amount || !form.date) {
      toast.error("⚠️ Isi semua kolom wajib!");
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
      const transactionData = {
        date: form.date,
        type: form.type,
        category: form.category,
        description: form.description,
        amount: cleanAmount,
        account_id: form.account_id || null
      };

      console.log("📤 Submitting from modal:", transactionData);

      // 🔥 FIX: Call the parent handler
      await onAdd(transactionData);

      // Modal will close from parent component

    } catch (error) {
      console.error("❌ Error in modal submission:", error);
      toast.error("❌ Gagal menambahkan transaksi!");
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === form.type);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                ➕ Tambah Transaksi
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tanggal */}
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">📅 Tanggal</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Jenis Transaksi */}
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">💰 Jenis</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, type: "income", category: "" })}
                      className={`py-3 px-4 rounded-xl border-2 transition-all ${form.type === "income"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 text-gray-600"
                        }`}
                    >
                      💵 Pemasukan
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, type: "expense", category: "" })}
                      className={`py-3 px-4 rounded-xl border-2 transition-all ${form.type === "expense"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-200 text-gray-600"
                        }`}
                    >
                      🛍️ Pengeluaran
                    </button>
                  </div>
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">📂 Kategori</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Pilih kategori...</option>
                    {filteredCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Akun */}
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">💳 Akun</label>
                  <select
                    name="account_id"
                    value={form.account_id}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih akun (opsional)</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} - Rp {account.balance?.toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">📝 Deskripsi</label>
                  <input
                    type="text"
                    name="description"
                    placeholder="Deskripsi transaksi"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Jumlah */}
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">💸 Jumlah (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                    <input
                      type="text"
                      name="amount"
                      placeholder="0"
                      value={form.amount}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-right text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Menyimpan...
                      </div>
                    ) : (
                      "💾 Simpan"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddTransactionModal;