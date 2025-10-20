import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function AddTransaction() {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    date: "",
    type: "expense",
    category: "",
    description: "",
    amount: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data.session?.user;
      setUser(currentUser);
      if (currentUser) fetchCategories(currentUser.id);
    });
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
      // Hilangkan karakter selain angka
      const numericValue = value.replace(/\D/g, "");
      // Format ke rupiah
      const formatted = new Intl.NumberFormat("id-ID").format(numericValue);
      setForm({ ...form, [name]: formatted });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.amount || !form.date) {
      toast.error("⚠️ Isi semua kolom wajib!");
      return;
    }

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
      console.error(error);
      toast.error("❌ Gagal menambahkan transaksi!");
    } else {
      toast.success("✅ Transaksi berhasil ditambahkan!");
      setForm({
        date: "",
        type: "expense",
        category: "",
        description: "",
        amount: "",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow-lg relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          ➕ Tambah Transaksi
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tanggal */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Tanggal</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Jenis transaksi */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Jenis</label>
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
            <label className="block text-gray-700 mb-1 font-medium">Kategori</label>
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
            <label className="block text-gray-700 mb-1 font-medium">Deskripsi</label>
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
            <label className="block text-gray-700 mb-1 font-medium">Jumlah (Rp)</label>
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

        {/* Tombol kembali */}
        <div className="pt-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg shadow-md transition"
          >
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
}
