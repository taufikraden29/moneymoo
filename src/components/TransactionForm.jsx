import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { formatRupiah } from "../utils/formatters";

const TransactionForm = ({ 
  transaction, 
  categories, 
  accounts,
  isEditing = false, 
  onSubmit, 
  onCancel 
}) => {
  const [form, setForm] = useState({
    date: "",
    type: "expense",
    category: "",
    description: "",
    amount: "",
    account_id: ""
  });
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter categories berdasarkan jenis transaksi
  const filteredCategories = categories.filter((c) => c.type === form.type);

  // Initialize form for editing
  useEffect(() => {
    if (transaction && isEditing) {
      setForm({
        date: transaction.date || new Date().toISOString().split("T")[0],
        type: transaction.type || "expense",
        category: transaction.category || "",
        description: transaction.description || "",
        amount: transaction.amount ? transaction.amount.toString() : "",
        account_id: transaction.account_id || ""
      });
    } else if (!isEditing) {
      // Initialize form for adding
      setForm({
        date: new Date().toISOString().split("T")[0],
        type: "expense",
        category: "",
        description: "",
        amount: "",
        account_id: ""
      });
    }
  }, [transaction, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "type") {
      // Reset category when type changes
      setForm(prev => ({
        ...prev,
        [name]: value,
        category: ""
      }));
    } else if (name === "amount") {
      const rawValue = value.replace(/\D/g, "");
      const formatted = rawValue ? new Intl.NumberFormat("id-ID").format(rawValue) : "";
      setForm(prev => ({ ...prev, [name]: formatted }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const getNumericAmount = () => {
    return Number(form.amount.replace(/\D/g, "")) || 0;
  };

  const validateForm = () => {
    const validationErrors = [];
    if (!form.date) validationErrors.push("tanggal");
    if (!form.category) validationErrors.push("kategori");
    if (!form.amount || getNumericAmount() === 0) validationErrors.push("jumlah");

    if (validationErrors.length > 0) {
      toast.error(`⚠️ Isi kolom wajib: ${validationErrors.join(", ")}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting || loading) {
      console.log("⚠️ Form submission blocked: already submitting");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    setIsSubmitting(true);

    try {
      const transactionData = {
        date: form.date,
        type: form.type,
        category: form.category,
        description: form.description,
        amount: getNumericAmount(),
        account_id: form.account_id || null
      };

      // If editing, include the original transaction amount to calculate difference
      if (isEditing && transaction) {
        transactionData.originalAmount = transaction.amount;
      }

      await onSubmit(transactionData);
    } catch (err) {
      console.error("❌ Error submitting transaction:", err);
      toast.error(`❌ Gagal ${isEditing ? 'memperbarui' : 'menambahkan'} transaksi!`);
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

  return (
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
        {filteredCategories.length === 0 && (
          <p className="text-xs text-orange-600 mt-2 bg-orange-50 p-2 rounded-lg">
            💡 Tidak ada kategori untuk {form.type === "income" ? "pemasukan" : "pengeluaran"}.
            Tambahkan kategori terlebih dahulu.
          </p>
        )}
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
          placeholder={`Contoh: ${form.type === "income" ? "gaji bulanan, bonus" : "makan siang, transportasi"}`}
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

      {/* Preview */}
      {form.amount && (
        <div className={`p-4 rounded-xl text-center font-bold text-lg border ${form.type === "income"
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-red-50 text-red-700 border-red-200"
          }`}>
          {form.type === "income" ? "➕ Pemasukan" : "➖ Pengeluaran"}
          <span className="font-mono ml-2">Rp {form.amount}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`flex-1 py-3 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            form.type === "income" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {isEditing ? 'Memperbarui...' : 'Menyimpan...'}
            </div>
          ) : (
            isEditing ? "💾 Simpan Perubahan" : "💾 Simpan"
          )}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;