import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function EditTransactionModal({
  open,
  onClose,
  transaction,
  categories = [],
  onSaved, // callback(updated)
}) {
  const [form, setForm] = useState({
    date: "",
    type: "expense",
    category: "",
    description: "",
    amount: "",
  });
  const [loading, setLoading] = useState(false);

  // Helper format Rupiah
  const formatRupiah = (number) => {
    if (!number) return "";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  useEffect(() => {
    if (transaction) {
      setForm({
        date: transaction.date || "",
        type: transaction.type || "expense",
        category: transaction.category || "",
        description: transaction.description || "",
        amount: transaction.amount || "",
      });
    }
  }, [transaction]);

  if (!open) return null;

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  // Handler khusus untuk jumlah
  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, ""); // hapus semua non-digit
    setForm((s) => ({ ...s, amount: rawValue }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.date || !form.category || !form.amount) {
      toast.error("Isi semua kolom wajib!");
      return;
    }

    setLoading(true);
    const savePromise = onSaved({ ...form, amount: Number(form.amount) });

    toast.promise(
      savePromise,
      {
        loading: "Menyimpan perubahan...",
        success: "Transaksi berhasil diperbarui!",
        error: "Gagal menyimpan perubahan!",
      },
      { position: "top-center" }
    );

    try {
      await savePromise;
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
        >
          ✕
        </button>

        <h3 className="text-lg font-semibold mb-4">Edit Transaksi</h3>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Tanggal</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mt-1 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Jenis</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mt-1 focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="expense">Pengeluaran</option>
              <option value="income">Pemasukan</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Kategori</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mt-1 focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Pilih kategori</option>
              {categories
                .filter((c) => c.type === form.type)
                .map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Deskripsi</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mt-1 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Jumlah (Rp)</label>
            <input
              name="amount"
              type="text"
              value={form.amount ? formatRupiah(form.amount) : ""}
              onChange={handleAmountChange}
              className="w-full border px-3 py-2 rounded mt-1 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border hover:bg-gray-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded text-white transition ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
