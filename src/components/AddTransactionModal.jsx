import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function AddTransactionModal({ open, onClose }) {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    date: today,
    type: "expense",
    category: "",
    description: "",
    amount: "",
  });

  // 🔹 Ambil user & kategori saat modal dibuka
  useEffect(() => {
    if (open) {
      supabase.auth.getSession().then(async ({ data }) => {
        const currentUser = data.session?.user;
        setUser(currentUser);
        if (currentUser) {
          const { data: cats, error } = await supabase
            .from("categories")
            .select("*")
            .eq("user_id", currentUser.id)
            .order("created_at", { ascending: false });
          if (!error) setCategories(cats || []);
        }
      });
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "amount") {
      const numeric = value.replace(/\D/g, "");
      const formatted = new Intl.NumberFormat("id-ID").format(numeric);
      setForm({ ...form, [name]: formatted });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.amount || !form.date)
      return toast.error("⚠️ Isi semua kolom wajib!");

    const cleanAmount = Number(form.amount.replace(/\D/g, ""));

    const { error } = await supabase.from("transactions").insert([
      {
        user_id: user.id,
        ...form,
        amount: cleanAmount,
        created_at: new Date(),
      },
    ]);

    if (error) {
      toast.error("Gagal menambahkan transaksi!");
    } else {
      toast.success("Transaksi berhasil ditambahkan!");

      // 🔊 Putar suara mesin kasir
      const audio = new Audio("/sounds/cashin.mp3");
      audio.play();

      setForm({
        date: today,
        type: "expense",
        category: "",
        description: "",
        amount: "",
      });

      if (onAdd) {
        onAdd({
          user_id: user.id,
          ...form,
          amount: cleanAmount,
          created_at: new Date(),
        });
      }

      onClose();
    }

  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl">
          <Dialog.Title className="text-2xl font-bold text-gray-800 mb-6 text-center">
            ➕ Tambah Transaksi
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tanggal */}
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Tanggal
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                max={today}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Jenis */}
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Jenis
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
              </select>
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Kategori
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Pilih kategori</option>
                {categories
                  .filter((c) => c.type === form.type)
                  .map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Deskripsi
              </label>
              <input
                type="text"
                name="description"
                placeholder="Contoh: makan siang / gaji bulan ini"
                value={form.description}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Jumlah */}
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Jumlah (Rp)
              </label>
              <input
                type="text"
                name="amount"
                placeholder="0"
                value={form.amount}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Tombol simpan */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow-md transition"
            >
              Simpan Transaksi
            </button>
          </form>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
            >
              Tutup
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
