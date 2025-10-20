// src/components/EditTransactionModal.jsx
import { useEffect, useState } from "react";

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

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.date || !form.category || !form.amount) {
            return alert("Isi semua kolom wajib!");
        }
        setLoading(true);
        try {
            await onSaved({ ...form, amount: Number(form.amount) });
            onClose();
        } catch (err) {
            console.error(err);
            alert("Gagal menyimpan perubahan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative">
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
                            className="w-full border px-3 py-2 rounded mt-1"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600">Jenis</label>
                        <select
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded mt-1"
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
                            className="w-full border px-3 py-2 rounded mt-1"
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
                            className="w-full border px-3 py-2 rounded mt-1"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600">Jumlah (Rp)</label>
                        <input
                            name="amount"
                            type="number"
                            value={form.amount}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded mt-1"
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded border"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 rounded bg-blue-600 text-white"
                        >
                            {loading ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
