import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { getDebts, addDebt, deleteDebt } from "../services/debtService";
import { motion } from "framer-motion";

export default function DebtsPage() {
  const [user, setUser] = useState(null);
  const [debts, setDebts] = useState([]);
  const [form, setForm] = useState({
    provider: "",
    monthly_payment: "",
    months: "",
  });

  // Hitung total otomatis
  const totalAmount =
    Number(form.monthly_payment || 0) * Number(form.months || 0);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) loadDebts();
  }, [user]);

  const loadDebts = async () => {
    try {
      const data = await getDebts(user.id);
      setDebts(data);
    } catch (err) {
      toast.error("Gagal memuat data hutang");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.provider || !form.monthly_payment || !form.months) {
      toast.error("Lengkapi semua kolom!");
      return;
    }

    try {
      const payload = {
        user_id: user.id,
        provider: form.provider,
        months: Number(form.months),
        monthly_payment: Number(form.monthly_payment),
        remaining_balance: totalAmount,
        status: "belum lunas",
        created_at: new Date(),
      };

      await addDebt(payload);
      toast.success("Hutang berhasil ditambahkan!");

      setForm({
        provider: "",
        monthly_payment: "",
        months: "",
      });

      loadDebts();
    } catch (err) {
      console.error("Error adding debt:", err);
      toast.error("Gagal menambah hutang");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Yakin ingin menghapus hutang ini?")) {
      await deleteDebt(id);
      toast.success("Hutang dihapus");
      loadDebts();
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        💸 Daftar Hutang
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-xl shadow mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Nama Penyedia"
            value={form.provider}
            onChange={(e) => setForm({ ...form, provider: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />

          <input
            type="number"
            placeholder="Nominal per Bulan"
            value={form.monthly_payment}
            onChange={(e) =>
              setForm({ ...form, monthly_payment: e.target.value })
            }
            className="border rounded-lg px-3 py-2"
          />

          <input
            type="number"
            placeholder="Durasi (bulan)"
            value={form.months}
            onChange={(e) => setForm({ ...form, months: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />

          <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 text-gray-700 font-medium">
            Total: Rp {totalAmount.toLocaleString("id-ID")}
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Simpan Hutang
        </button>
      </form>

      <div className="grid gap-4">
        {debts.length === 0 ? (
          <p className="text-gray-500 text-sm">Belum ada hutang</p>
        ) : (
          debts.map((d, i) => (
            <motion.div
              key={d.id || i}
              className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
              whileHover={{ scale: 1.02 }}
            >
              <div>
                <h2 className="font-semibold text-gray-700">{d.provider}</h2>
                <p className="text-sm text-gray-500">
                  Angsuran: Rp{" "}
                  {Number(d.monthly_payment).toLocaleString("id-ID")} ×{" "}
                  {d.months} bulan
                </p>
                <p className="text-xs text-gray-400">
                  Sisa: Rp {Number(d.remaining_balance).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(d.id)}
                  className="bg-red-100 text-red-600 px-3 py-1 rounded-md hover:bg-red-200"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
