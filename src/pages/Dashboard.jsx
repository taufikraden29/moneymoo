import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {
  getTransactions,
  updateTransaction,
  deleteTransaction,
  saveTransaction,
} from "../services/TransactionService";
import EditTransactionModal from "../components/EditTransactionModal";
import ReportChart from "../components/ReportChart";
import toast from "react-hot-toast";
import FinancialStatusCard from "../components/FinancialStatusCard";
import CategoryModal from "../components/CategoryModal";
import AddTransactionModal from "../components/AddTransactionModal";
import AffirmationCard from "@/components/AffirmationCard";
import AccountModal from "../components/AccountModal";
import StatusCardAccount from "../components/StatusCardAccount";
import { motion } from "framer-motion";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Akun
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);

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

  // Transaction
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

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

  const loadTransactions = async (pageParam = 1, limitParam = 10) => {
    setLoading(true);
    const start = (pageParam - 1) * limitParam;
    const end = start + limitParam - 1;

    const { data, count } = await supabase
      .from("transactions")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .range(start, end);

    setTransactions(data || []);
    setTotalPages(Math.ceil(count / limitParam));
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      loadTransactions();
      loadAccounts(); // 🔹 Tambahkan ini
    }
  }, [user]);

  const loadAccounts = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", user.id);

    if (error) console.error(error);
    else setAccounts(data || []);
  };

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (user) loadTransactions();
  //   }, 300);
  //   return () => clearTimeout(timer);
  // }, [from, to, filterType, filterCategory, q]);

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      const start = (page - 1) * limit;
      const end = start + limit - 1;

      const { data, count } = await supabase
        .from("transactions")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .range(start, end);

      setTransactions(data || []);
      setTotalPages(Math.ceil(count / limit));
      setLoading(false);
    };

    if (user) loadTransactions();
  }, [user, page, limit, filterType, filterCategory, from, to, q]);

  const handleAddTransaction = async () => {
    const { data: existingTransaction } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .eq("amount", amount)
      .eq("description", description)
      .eq("category_id", category)
      .single();

    if (existingTransaction) {
      toast.error("Transaksi dengan detail yang sama sudah ada!");
      return; // Hentikan proses agar tidak lanjut insert
    }

    const { error } = await supabase.from("transactions").insert([
      {
        user_id: user.id,
        amount,
        description,
        category_id: category,
        date: new Date(),
      },
    ]);

    if (!error) {
      toast.success("Transaksi berhasil ditambahkan!");
    } else {
      toast.error("Gagal menambahkan transaksi!");
    }
  };

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="relative flex flex-col items-center">
          {/* Spinner */}
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>

          {/* Text */}
          <h1 className="mt-6 text-lg font-semibold text-gray-700 animate-pulse">
            Memeriksa sesi Anda...
          </h1>

          {/* Subtext */}
          <p className="text-sm text-gray-500 mt-2">Mohon tunggu sebentar ✨</p>
        </div>
      </div>
    );
  }

  if (!user) return null; // tidak render apapun jika user tidak ada

  const today = new Date().toISOString().split("T")[0];
  const todayTransactions = transactions.filter((t) => t.date === today);
  const todayIncome = todayTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const todayExpense = todayTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-6"
    >
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        {/* Header */}

        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md shadow-sm border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 p-4 rounded-xl">
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
              onClick={() => navigate("/utang")}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
            >
              💸 Hutang Saya
            </button>
            <button
              onClick={() => setShowAccountModal(true)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition"
            >
              💳 Akun
            </button>

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
              onAdd={handleAddTransaction}
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

        {/* Summary Section */}
        <div className="h-full">
          <FinancialStatusCard
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            todayIncome={todayIncome}
            todayExpense={todayExpense}
            selectedAccount={selectedAccount}
          />
        </div>

        {/* Account */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {accounts.map((acc) => {
            const accTransactions = transactions.filter(
              (t) => t.account_id === acc.id
            );

            const totalIncome = accTransactions
              .filter((t) => t.type === "income")
              .reduce((a, b) => a + Number(b.amount), 0);

            const totalExpense = accTransactions
              .filter((t) => t.type === "expense")
              .reduce((a, b) => a + Number(b.amount), 0);

            return (
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <StatusCardAccount
                  key={acc.id}
                  account={acc}
                  totalIncome={totalIncome}
                  totalExpense={totalExpense}
                />
              </motion.div>
            );
          })}
        </section>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow p-5 mb-8 border border-gray-100 mt-8">
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

        {/* Transactions */}
        <section className="bg-white rounded-xl shadow p-6 border border-gray-100 mt-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              📋 Daftar Transaksi
            </h2>

            {/* 🔹 Rows per page */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Tampilkan:</label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-600">/ halaman</span>
            </div>
          </div>

          {/* 🔹 FILTERS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 mb-6">
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

          {/* 🔹 TRANSACTIONS */}
          {loading ? (
            <p className="text-gray-500 text-sm">Memuat data...</p>
          ) : transactions.length === 0 ? (
            <p className="text-gray-500 text-sm">Belum ada transaksi</p>
          ) : (
            Object.entries(
              transactions.reduce((acc, trx) => {
                const dateObj = new Date(trx.date || trx.created_at);
                const dateStr = dateObj.toISOString().split("T")[0];
                if (!acc[dateStr]) acc[dateStr] = [];
                acc[dateStr].push(trx);
                return acc;
              }, {})
            )
              .sort((a, b) => new Date(b[0]) - new Date(a[0]))
              .map(([dateStr, trxs]) => {
                const today = new Date();
                const trxDate = new Date(dateStr);
                const diffDays = Math.floor(
                  (today - trxDate) / (1000 * 60 * 60 * 24)
                );

                let label =
                  diffDays === 0
                    ? "📅 Hari Ini"
                    : diffDays === 1
                    ? "📆 Kemarin"
                    : trxDate.toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      });

                return (
                  <div key={dateStr} className="mb-5">
                    <h3 className="font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-1">
                      {label}
                    </h3>

                    <div className="divide-y divide-gray-200">
                      {trxs.map((trx) => {
                        const date = new Date(trx.created_at || trx.date);
                        const tanggal = date.toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        });
                        const waktu = date.toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <motion.div
                            key={trx.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 hover:bg-gray-50 transition rounded-lg px-2"
                          >
                            {/* Kiri: Detail transaksi */}
                            <div className="space-y-1">
                              <div className="font-medium text-gray-800">
                                {trx.category}
                              </div>
                              <div className="text-xs text-gray-500">
                                🏦 {trx.account_name || "Tanpa Akun"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {tanggal} • {waktu} • {trx.description || "-"}
                              </div>
                            </div>

                            {/* Kanan: Jumlah + Aksi */}
                            <div className="flex items-center gap-3 mt-2 sm:mt-0">
                              <div
                                className={`font-semibold text-sm ${
                                  trx.type === "income"
                                    ? "text-green-600"
                                    : "text-red-500"
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
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
          )}

          {/* 🔹 PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                ⬅️ Prev
              </button>
              <span className="text-sm text-gray-700">
                Halaman {page} dari {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                Next ➡️
              </button>
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

        {/* Modal Akun */}
        <AccountModal
          open={showAccountModal}
          onClose={() => setShowAccountModal(false)}
          user={user}
        />
      </div>
    </motion.div>
  );
}
