import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function EditTransactionModal({
  open,
  onClose,
  transaction,
  categories = [],
  onSaved,
}) {
  const [form, setForm] = useState({
    date: "",
    type: "expense",
    category: "",
    description: "",
    amount: "",
  });
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter categories berdasarkan jenis transaksi
  const filteredCategories = categories.filter((c) => c.type === form.type);

  useEffect(() => {
    if (transaction && open) {
      setForm({
        date: transaction.date || "",
        type: transaction.type || "expense",
        category: transaction.category || "",
        description: transaction.description || "",
        amount: transaction.amount ? transaction.amount.toString() : "",
      });
    }
  }, [transaction, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "type") {
      // Reset category ketika jenis berubah
      setForm(prev => ({
        ...prev,
        [name]: value,
        category: ""
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const formatted = rawValue ? new Intl.NumberFormat("id-ID").format(rawValue) : "";
    setForm(prev => ({ ...prev, amount: formatted }));
  };

  const getNumericAmount = () => {
    return Number(form.amount.replace(/\D/g, "")) || 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // 🔥 FIX: Prevent double submission
    if (isSubmitting || loading) {
      console.log("⚠️ Edit submission blocked: already submitting");
      return;
    }

    // Validasi
    const validationErrors = [];
    if (!form.date) validationErrors.push("tanggal");
    if (!form.category) validationErrors.push("kategori");
    if (!form.amount || getNumericAmount() === 0) validationErrors.push("jumlah");

    if (validationErrors.length > 0) {
      toast.error(`⚠️ Isi kolom wajib: ${validationErrors.join(", ")}`);
      return;
    }

    setLoading(true);
    setIsSubmitting(true);

    try {
      const updatedData = {
        date: form.date,
        type: form.type,
        category: form.category,
        description: form.description,
        amount: getNumericAmount(),
      };

      console.log("📤 Saving transaction update:", updatedData);

      await onSaved(updatedData);

      // Success handled by parent component

    } catch (err) {
      console.error("❌ Error saving transaction:", err);
      // Error handled by parent component
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (number) => {
    if (!number) return "";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const getOriginalAmount = () => {
    return transaction?.amount ? Number(transaction.amount) : 0;
  };

  const getAmountChange = () => {
    const original = getOriginalAmount();
    const updated = getNumericAmount();
    return updated - original;
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">✏️ Edit Transaksi</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Perbarui detail transaksi
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-blue-200 text-xl transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <form onSubmit={handleSave} className="space-y-5">
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
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
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
                      onClick={() => setForm({ ...form, type: "income", category: "" })}
                      className={`py-3 px-4 rounded-xl border-2 transition-all duration-200 font-medium ${form.type === "income"
                        ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                        }`}
                    >
                      💵 Pemasukan
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, type: "expense", category: "" })}
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
                  <label className="block text-gray-700 mb-2 font-semibold text-sm">
                    📂 Kategori
                  </label>
                  <select
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
                  </select>
                  {filteredCategories.length === 0 && (
                    <p className="text-xs text-orange-600 mt-2 bg-orange-50 p-2 rounded-lg">
                      💡 Tidak ada kategori untuk {form.type === "income" ? "pemasukan" : "pengeluaran"}.
                      Tambahkan kategori terlebih dahulu.
                    </p>
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
                    placeholder={`Contoh: ${form.type === "income" ? "gaji bulanan, bonus" : "makan siang, transportasi"}`}
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
                      onChange={handleAmountChange}
                      className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-right text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  {form.amount && (
                    <div className="flex justify-between items-center mt-2 text-xs">
                      <span className="text-gray-500">
                        Terbaca: <span className="font-mono">Rp {form.amount}</span>
                      </span>
                      {transaction && (
                        <span className={`font-semibold ${getAmountChange() > 0 ? 'text-green-600' :
                          getAmountChange() < 0 ? 'text-red-600' : 'text-gray-500'
                          }`}>
                          {getAmountChange() !== 0 && (
                            <>
                              {getAmountChange() > 0 ? '↑' : '↓'}
                              {formatRupiah(Math.abs(getAmountChange()))}
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Preview */}
                {form.amount && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-xl text-center font-bold text-lg border ${form.type === "income"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                      }`}
                  >
                    {form.type === "income" ? "➕ Pemasukan" : "➖ Pengeluaran"}
                    <span className="font-mono ml-2">Rp {form.amount}</span>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <motion.button
                    type="submit"
                    disabled={loading || isSubmitting}
                    whileHover={!(loading || isSubmitting) ? { scale: 1.02 } : {}}
                    whileTap={!(loading || isSubmitting) ? { scale: 0.98 } : {}}
                    className={`flex-1 py-3 rounded-xl font-semibold text-white transition-all duration-200 ${loading || isSubmitting
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
                      "💾 Simpan Perubahan"
                    )}
                  </motion.button>
                </div>
              </form>

              {/* Original Transaction Info */}
              {transaction && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-700 text-sm mb-2">
                    📋 Info Asli Transaksi
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Tanggal:</span>
                      <p>{new Date(transaction.date).toLocaleDateString('id-ID')}</p>
                    </div>
                    <div>
                      <span className="font-medium">Kategori:</span>
                      <p>{transaction.category}</p>
                    </div>
                    <div>
                      <span className="font-medium">Jumlah:</span>
                      <p className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {formatRupiah(transaction.amount)}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Deskripsi:</span>
                      <p className="truncate">{transaction.description || '-'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}