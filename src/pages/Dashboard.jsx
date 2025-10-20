import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from "../services/TransactionService";
import EditTransactionModal from "../components/EditTransactionModal";
import ReportChart from "../components/ReportChart";
import toast from "react-hot-toast";
import FinancialStatusCard from "../components/FinancialStatusCard";
import CategoryModal from "../components/CategoryModal";
import AddTransactionModal from "../components/AddTransactionModal";
import AffirmationCard from "@/components/AffirmationCard";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Filters
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [q, setQ] = useState("");

  // Edit modal
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Chart
  const [chartData, setChartData] = useState([]);
  const [chartType, setChartType] = useState("expense");

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        navigate("/", { replace: true }); // langsung redirect tanpa flicker
      } else {
        setUser(data.user);
      }
      setAuthChecked(true); // tandai proses sudah selesai
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadCategories();
      loadTransactions();
    }
  }, [user]);

  useEffect(() => {
    if (transactions.length > 0) {
      const filtered = transactions.filter((trx) => trx.type === chartType);
      const totals = filtered.reduce((acc, trx) => {
        const cat = trx.category || "Tanpa Kategori";
        acc[cat] = (acc[cat] || 0) + Number(trx.amount);
        return acc;
      }, {});
      const formatted = Object.entries(totals).map(([name, value]) => ({
        name,
        value,
      }));
      setChartData(formatted);
    } else {
      setChartData([]);
    }
  }, [transactions, chartType]);

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
      toast.error("Gagal memuat transaksi!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) loadTransactions();
    }, 300);
    return () => clearTimeout(timer);
  }, [from, to, filterType, filterCategory, q]);

  const handleDelete = async (id) => {
    toast(
      (t) => (
        <div className="flex flex-col items-start gap-3">
          <span>Yakin ingin menghapus transaksi ini?</span>
          <div className="flex gap-3">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await toast.promise(
                    deleteTransaction(id),
                    {
                      loading: "Menghapus transaksi...",
                      success: "Transaksi berhasil dihapus!",
                      error: "Gagal menghapus transaksi!",
                    },
                    { position: "top-center" }
                  );

                  // Hapus transaksi dari state tanpa reload penuh
                  setTransactions((prev) =>
                    prev.filter((trx) => trx.id !== id)
                  );
                } catch (err) {
                  console.error("Error saat hapus:", err);
                }
              }}
              className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
            >
              Ya, hapus
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm hover:bg-gray-400"
            >
              Batal
            </button>
          </div>
        </div>
      ),
      { position: "top-center" }
    );
  };

  const openEdit = (trx) => {
    setEditing(trx);
    setModalOpen(true);
  };

  const handleSaveEdit = async (updatedPayload) => {
    const promise = updateTransaction(editing.id, updatedPayload);
    toast.promise(
      promise,
      {
        loading: "Menyimpan perubahan...",
        success: "Transaksi berhasil diperbarui!",
        error: "Gagal memperbarui transaksi!",
      },
      { position: "top-center" }
    );
    await promise;
    await loadTransactions();
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-xl font-bold">Memeriksa sesi...</h1>
      </div>
    );
  }

  if (!user) return null; // tidak render apapun jika user tidak ada

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      {/* Header */}

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            👋 Halo, <span className="text-blue-600">{user?.email}</span>
          </h1>
          <p className="text-gray-500 text-sm">
            Selamat datang di dashboard keuanganmu
          </p>
        </div>
        <div className="md:hidden w-full bg-gradient-to-r from-green-100 to-teal-200 text-center p-3 rounded-b-xl shadow-sm">
          <h1 className="text-lg font-semibold text-gray-700">
            🌱 Afirmasi Positif Keuangan
          </h1>
          <div className="mt-1">
            <AffirmationCard />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition"
          >
            📁 Kategori
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
          >
            ➕ Tambah
          </button>
          <AddTransactionModal
            open={addModalOpen}
            onClose={() => setAddModalOpen(false)}
          />

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              toast.success("Berhasil keluar!");
              // Navigasi ke dashboard agar efek sekedip muncul
              navigate("/");
            }}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
          >
            🚪 Keluar
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-5 mb-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Semua Tipe</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
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
            placeholder="Cari deskripsi..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm col-span-2 focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow p-5 mb-8 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-700">Grafik Transaksi</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setChartType("expense")}
              className={`px-3 py-1 rounded-lg text-sm ${
                chartType === "expense"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              Pengeluaran
            </button>
            <button
              onClick={() => setChartType("income")}
              className={`px-3 py-1 rounded-lg text-sm ${
                chartType === "income"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              Pemasukan
            </button>
          </div>
        </div>
        <ReportChart data={chartData} />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
          <div className="text-sm text-gray-500">Pemasukan</div>
          <div className="text-5xl font-bold text-green-600 mt-1">
            Rp {totalIncome.toLocaleString("id-ID")}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-red-500">
          <div className="text-sm text-gray-500">Pengeluaran</div>
          <div className="text-5xl font-bold text-red-500 mt-1">
            Rp {totalExpense.toLocaleString("id-ID")}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-600">
          <div className="text-sm text-gray-500">Saldo</div>
          <div
            className={`text-5xl font-bold mt-1 ${
              balance >= 0 ? "text-blue-600" : "text-red-600"
            }`}
          >
            Rp {balance.toLocaleString("id-ID")}
          </div>
        </div>

        {/* Status Keuangan */}
        <FinancialStatusCard
          totalIncome={totalIncome}
          totalExpense={totalExpense}
        />
      </div>

      {/* Transactions */}
      <section className="bg-white rounded-xl shadow p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          📋 Daftar Transaksi
        </h2>
        {loading ? (
          <p className="text-gray-500 text-sm">Memuat data...</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-500 text-sm">Belum ada transaksi</p>
        ) : (
          <div className="divide-y divide-gray-200">
            {transactions.map((trx) => (
              <div
                key={trx.id}
                className="flex justify-between items-center py-3 hover:bg-gray-50 transition rounded-lg px-2"
              >
                <div>
                  <div className="font-medium text-gray-800">
                    {trx.category}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(trx.date).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    • {trx.description || "-"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`font-semibold text-sm ${
                      trx.type === "income" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {trx.type === "income" ? "+" : "-"} Rp{" "}
                    {Number(trx.amount).toLocaleString("id-ID")}
                  </div>
                  <button
                    onClick={() => openEdit(trx)}
                    className="text-xs px-2 py-1 bg-yellow-100 hover:bg-yellow-200 rounded transition"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(trx.id)}
                    className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 rounded transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {modalOpen && (
        <EditTransactionModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          transaction={editing}
          categories={categories}
          onSaved={handleSaveEdit}
        />
      )}

      {/* 🧩 Modal Kategori */}
      <CategoryModal
        open={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
      />
    </div>
  );
}
