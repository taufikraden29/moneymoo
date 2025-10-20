// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from "../pages/TransactionService";
import EditTransactionModal from "../components/EditTransactionModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filterType, setFilterType] = useState(""); // "", "income", "expense"
  const [filterCategory, setFilterCategory] = useState("");
  const [q, setQ] = useState("");

  // Edit modal state
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        navigate("/");
        return;
      }
      setUser(data.user);
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadCategories();
      loadTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error) setCategories(data || []);
  };

  const loadTransactions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getTransactions({
        user_id: user.id,
        from: from || undefined,
        to: to || undefined,
        type: filterType || undefined,
        category: filterCategory || undefined,
        q: q || undefined,
      });
      setTransactions(data);
    } catch (err) {
      console.error("Gagal ambil transaksi:", err);
      alert("Gagal memuat transaksi");
    } finally {
      setLoading(false);
    }
  };

  // apply filters immediately on change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) loadTransactions();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, filterType, filterCategory, q]);

  const handleDelete = async (id) => {
    if (!confirm("Hapus transaksi ini?")) return;
    try {
      await deleteTransaction(id);
      await loadTransactions();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus transaksi");
    }
  };

  const openEdit = (trx) => {
    setEditing(trx);
    setModalOpen(true);
  };

  const handleSaveEdit = async (updatedPayload) => {
    try {
      await updateTransaction(editing.id, updatedPayload);
      await loadTransactions();
    } catch (err) {
      throw err;
    }
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          👋 Halo, <span className="text-blue-600">{user?.email}</span>
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/categories")}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded"
          >
            Kategori
          </button>
          <button
            onClick={() => navigate("/add-transaction")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
          >
            + Tambah
          </button>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
          >
            Keluar
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border px-3 py-2 rounded col-span-1"
            placeholder="From"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border px-3 py-2 rounded col-span-1"
            placeholder="To"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border px-3 py-2 rounded col-span-1"
          >
            <option value="">Semua Tipe</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border px-3 py-2 rounded col-span-2"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="border px-3 py-2 rounded col-span-1"
            placeholder="Cari deskripsi atau kategori..."
          />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl shadow">
          <div className="text-sm text-gray-500">Pemasukan</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            Rp {totalIncome.toLocaleString("id-ID")}
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow">
          <div className="text-sm text-gray-500">Pengeluaran</div>
          <div className="text-2xl font-bold text-red-500 mt-1">
            Rp {totalExpense.toLocaleString("id-ID")}
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow">
          <div className="text-sm text-gray-500">Saldo</div>
          <div className={`text-2xl font-bold mt-1 ${balance >= 0 ? "text-blue-600" : "text-red-600"}`}>
            Rp {balance.toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <section className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Transaksi</h2>

        {loading ? (
          <p className="text-gray-500">Memuat...</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-500">Belum ada transaksi</p>
        ) : (
          <div className="divide-y divide-gray-200">
            {transactions.map((trx) => (
              <div key={trx.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-gray-800">{trx.category}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(trx.date).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })} • {trx.description || "-"}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`font-semibold ${trx.type === "income" ? "text-green-600" : "text-red-500"}`}>
                    {trx.type === "income" ? "+" : "-"} Rp {Number(trx.amount).toLocaleString("id-ID")}
                  </div>

                  <button
                    onClick={() => openEdit(trx)}
                    className="text-sm px-2 py-1 bg-yellow-100 hover:bg-yellow-200 rounded"
                    title="Edit"
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() => handleDelete(trx.id)}
                    className="text-sm px-2 py-1 bg-red-100 hover:bg-red-200 rounded"
                    title="Hapus"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Edit modal */}
      {modalOpen && (
        <EditTransactionModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          transaction={editing}
          categories={categories}
          onSaved={handleSaveEdit}
        />
      )}
    </div>
  );
}
