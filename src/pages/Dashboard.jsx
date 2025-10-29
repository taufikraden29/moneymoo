import { useEffect, useState, useCallback, useMemo } from "react";
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
import { motion, AnimatePresence } from "framer-motion";

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

  // Mobile states
  const [showFilters, setShowFilters] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  // 🔥 NEW: Refresh state untuk force update
  const [refreshKey, setRefreshKey] = useState(0);

  // 🔥 NEW: Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Auto-show sections on larger screens
      if (window.innerWidth >= 768) {
        setActiveSection("overview");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        navigate("/", { replace: true });
      } else {
        setUser(data.user);
      }
      setAuthChecked(true);
    };
    checkUser();
  }, [navigate]);

  // 🔥 OPTIMIZED: Load data dengan useCallback
  const loadCategories = useCallback(async () => {
    if (!user) return;
    console.log("🔄 Loading categories...");
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error) {
      setCategories(data || []);
    } else {
      console.error("❌ Error loading categories:", error);
    }
  }, [user]);

  const loadAccounts = useCallback(async () => {
    if (!user) return;
    console.log("🔄 Loading accounts...");
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("❌ Error loading accounts:", error);
    } else {
      setAccounts(data || []);
    }
  }, [user]);

  const loadTransactions = useCallback(
    async (pageParam = 1, limitParam = 10) => {
      if (!user) return;

      setLoading(true);

      let query = supabase
        .from("transactions")
        .select(
          `
      *,
      accounts:account_id (
        id,
        name,
        type
      )
    `,
          { count: "exact" }
        )
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      // Apply filters
      if (from) query = query.gte("date", from);
      if (to) query = query.lte("date", to);
      if (filterType) query = query.eq("type", filterType);
      if (filterCategory) query = query.eq("category", filterCategory);
      if (q) query = query.ilike("description", `%${q}%`);

      const start = (pageParam - 1) * limitParam;
      const end = start + limitParam - 1;

      const { data, count, error } = await query.range(start, end);

      if (error) {
        console.error("Error loading transactions:", error);
        toast.error("Gagal memuat transaksi");
      } else {
        setTransactions(data || []);
        setTotalPages(Math.ceil(count / limitParam) || 1);
      }
      setLoading(false);
    },
    [user, from, to, filterType, filterCategory, q]
  );

  // 🔥 OPTIMIZED: Load all data when user changes
  useEffect(() => {
    if (user) {
      Promise.all([
        loadCategories(),
        loadAccounts(),
        loadTransactions(page, limit),
      ]);
    }
  }, [
    user,
    loadCategories,
    loadAccounts,
    loadTransactions,
    page,
    limit,
    refreshKey,
  ]);

  // 🔥 OPTIMIZED: Chart data calculation with useMemo
  const memoizedChartData = useMemo(() => {
    if (transactions.length > 0) {
      const filtered = transactions.filter((trx) => trx.type === chartType);
      const totals = filtered.reduce((acc, trx) => {
        const cat = trx.category || "Tanpa Kategori";
        acc[cat] = (acc[cat] || 0) + Number(trx.amount);
        return acc;
      }, {});
      return Object.entries(totals).map(([name, value]) => ({
        name,
        value,
      }));
    }
    return [];
  }, [transactions, chartType]);

  useEffect(() => {
    setChartData(memoizedChartData);
  }, [memoizedChartData]);

  // 🔥 NEW: Refresh function untuk manual update
  const refreshData = useCallback(() => {
    console.log("🔄 Manual refresh triggered");
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleAddTransaction = async (transactionData) => {
    try {
      if (loading) {
        console.log("⚠️ Transaction submission blocked: already loading");
        return;
      }

      setLoading(true);

      // 🔥 FIX: Check for duplicate transaction before inserting
      const { data: existingTransaction } = await supabase
        .from("transactions")
        .select("id")
        .eq("user_id", user.id)
        .eq("amount", transactionData.amount)
        .eq("description", transactionData.description)
        .eq("category", transactionData.category)
        .eq("date", transactionData.date)
        .single();

      if (existingTransaction) {
        toast.error("❌ Transaksi dengan detail yang sama sudah ada!");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("transactions")
        .insert([
          {
            user_id: user.id,
            ...transactionData,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success("✅ Transaksi berhasil ditambahkan!");
      setAddModalOpen(false);

      // 🔥 FIX: Refresh semua data setelah transaksi berhasil
      await Promise.all([loadTransactions(), loadAccounts()]);
    } catch (error) {
      console.error("❌ Error in handleAddTransaction:", error);
      toast.error(`❌ Gagal menambahkan transaksi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    toast(
      (t) => (
        <div className="flex flex-col items-start gap-3 p-2">
          <span className="text-gray-800 font-medium">
            Yakin ingin menghapus transaksi ini?
          </span>
          <div className="flex gap-2 w-full">
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
                  await loadTransactions();
                } catch (err) {
                  console.error("Error saat hapus:", err);
                }
              }}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Ya, Hapus
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm hover:bg-gray-400 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        duration: 5000,
      }
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

  // 🔥 NEW: Handler untuk success dari modal
  const handleAccountSuccess = useCallback(() => {
    console.log("✅ Account added/updated, refreshing data...");
    refreshData();
  }, [refreshData]);

  const handleCategorySuccess = useCallback(() => {
    console.log("✅ Category added/updated, refreshing data...");
    refreshData();
  }, [refreshData]);

  // 🔥 OPTIMIZED: Financial calculations with useMemo
  const financialData = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + Number(t.amount), 0);
    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + Number(t.amount), 0);
    const balance = totalIncome - totalExpense;

    const today = new Date().toISOString().split("T")[0];
    const todayTransactions = transactions.filter((t) => t.date === today);
    const todayIncome = todayTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const todayExpense = todayTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance,
      todayIncome,
      todayExpense,
    };
  }, [transactions]);

  // 🔥 NEW: Grouped transactions by date with useMemo
  const groupedTransactions = useMemo(() => {
    return Object.entries(
      transactions.reduce((acc, trx) => {
        const dateObj = new Date(trx.date || trx.created_at);
        const dateStr = dateObj.toISOString().split("T")[0];
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(trx);
        return acc;
      }, {})
    ).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  }, [transactions]);

  // 🔥 NEW: Mobile navigation component dengan improved responsive behavior
  const MobileNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-inset-bottom">
      <div className="flex justify-around items-center p-2">
        {[
          { id: "overview", icon: "📊", label: "Overview" },
          { id: "accounts", icon: "💳", label: "Akun" },
          {
            id: "utang",
            icon: "💸",
            label: "Hutang",
            action: () => navigate("/utang"),
          },
          {
            id: "add",
            icon: "➕",
            label: "Tambah",
            action: () => setAddModalOpen(true),
            primary: true,
          },
          { id: "transactions", icon: "📋", label: "Transaksi" },
          {
            id: "filters",
            icon: "🔍",
            label: "Filter",
            action: () => setShowFilters(!showFilters),
          },
        ].map((item) => {
          if (item.action) {
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors min-w-0 flex-1 mx-1 ${
                  item.primary
                    ? "bg-blue-600 text-white"
                    : activeSection === item.id
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs mt-1 truncate w-full text-center">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors min-w-0 flex-1 ${
                activeSection === item.id
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs mt-1 truncate w-full text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // 🔥 NEW: Render condition untuk sections
  const shouldShowSection = (section) => {
    return !isMobile || activeSection === section;
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="relative flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <h1 className="mt-6 text-lg font-semibold text-gray-700 animate-pulse">
            Memeriksa sesi Anda...
          </h1>
          <p className="text-sm text-gray-500 mt-2">Mohon tunggu sebentar ✨</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-20 md:pb-6 safe-area-inset-bottom"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100 p-4 safe-area-inset-top">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 tracking-tight truncate">
                👋 Halo,{" "}
                <span className="text-blue-600">
                  {user?.email?.split("@")[0]}
                </span>
              </h1>
              <p className="text-gray-500 text-sm sm:text-base">
                Selamat datang di dashboard keuanganmu
              </p>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2 flex-wrap justify-end">
              <button
                onClick={() => navigate("/utang")}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm text-sm"
              >
                💸 Hutang
              </button>
              <button
                onClick={() => setShowAccountModal(true)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors text-sm"
              >
                💳 Akun
              </button>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors text-sm"
              >
                📁 Kategori
              </button>
              <button
                onClick={() => setAddModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition-colors text-sm"
              >
                ➕ Tambah
              </button>
              <button
                onClick={refreshData}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                title="Refresh data"
              >
                🔄
              </button>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  toast.success("Berhasil keluar!");
                  navigate("/");
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
              >
                🚪 Keluar
              </button>
            </div>

            {/* Mobile Affirmation - Only show in overview */}
            {isMobile && shouldShowSection("overview") && (
              <div className="w-full bg-gradient-to-r from-green-100 to-teal-200 p-3 rounded-xl shadow-sm mt-2">
                <AffirmationCard />
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Mobile Navigation */}
        {isMobile && <MobileNav />}

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Overview Section */}
          <AnimatePresence>
            {shouldShowSection("overview") && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Financial Summary */}
                <FinancialStatusCard
                  totalIncome={financialData.totalIncome}
                  totalExpense={financialData.totalExpense}
                  todayIncome={financialData.todayIncome}
                  todayExpense={financialData.todayExpense}
                  selectedAccount={selectedAccount}
                />

                {/* Chart */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                    <h2 className="font-semibold text-gray-700 text-lg">
                      Grafik Transaksi
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setChartType("expense")}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-1 ${
                          chartType === "expense"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        Pengeluaran
                      </button>
                      <button
                        onClick={() => setChartType("income")}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-1 ${
                          chartType === "income"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        Pemasukan
                      </button>
                    </div>
                  </div>
                  <div className="h-64 sm:h-80">
                    <ReportChart data={chartData} />
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Accounts Section */}
          <AnimatePresence>
            {shouldShowSection("accounts") && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {accounts.length === 0 ? (
                  <div className="col-span-full text-center py-8 bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="text-6xl text-gray-300 mb-4">💳</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Belum Ada Akun
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Tambahkan akun pertama Anda untuk mulai mencatat transaksi
                    </p>
                    <button
                      onClick={() => setShowAccountModal(true)}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      ➕ Tambah Akun Pertama
                    </button>
                  </div>
                ) : (
                  accounts.map((acc) => {
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
                        key={acc.id}
                        whileHover={{ scale: isMobile ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <StatusCardAccount
                          account={acc}
                          totalIncome={totalIncome}
                          totalExpense={totalExpense}
                        />
                      </motion.div>
                    );
                  })
                )}
              </motion.section>
            )}
          </AnimatePresence>

          {/* Transactions Section */}
          <AnimatePresence>
            {shouldShowSection("transactions") && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                  <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    📋 Daftar Transaksi
                  </h2>

                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600 hidden sm:block">
                      Tampilkan:
                    </label>
                    <select
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1);
                      }}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent w-full md:w-auto"
                    >
                      {[5, 10, 20, 50].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm text-gray-600 hidden md:block">
                      / halaman
                    </span>
                  </div>
                </div>

                {/* Filters */}
                <AnimatePresence>
                  {(showFilters || !isMobile) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-6 overflow-hidden"
                    >
                      <input
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        placeholder="Dari tanggal"
                      />
                      <input
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        placeholder="Sampai tanggal"
                      />
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      >
                        <option value="">Semua Tipe</option>
                        <option value="income">Pemasukan</option>
                        <option value="expense">Pengeluaran</option>
                      </select>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
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
                        className="border border-gray-300 px-3 py-2 rounded-lg text-sm col-span-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Transactions List */}
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-6xl mb-4">📝</div>
                    <p className="text-gray-500 text-sm">Belum ada transaksi</p>
                    <button
                      onClick={() => setAddModalOpen(true)}
                      className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Tambah Transaksi Pertama
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupedTransactions.map(([dateStr, trxs]) => {
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
                        <div key={dateStr} className="space-y-3">
                          <h3 className="font-semibold text-gray-700 text-sm border-b border-gray-200 pb-2 sticky top-16 bg-white/80 backdrop-blur-sm py-2">
                            {label}
                          </h3>
                          <div className="space-y-2">
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
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.2 }}
                                  className="flex justify-between items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <div className="font-medium text-gray-800 truncate">
                                        {trx.category}
                                      </div>
                                      <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border">
                                        {trx.accounts?.name || "Tanpa Akun"}
                                      </div>
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                      {trx.description || "-"}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      {tanggal} • {waktu}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                                    <div
                                      className={`font-semibold text-sm whitespace-nowrap ${
                                        trx.type === "income"
                                          ? "text-green-600"
                                          : "text-red-500"
                                      }`}
                                    >
                                      {trx.type === "income" ? "+" : "-"} Rp{" "}
                                      {Number(trx.amount).toLocaleString(
                                        "id-ID"
                                      )}
                                    </div>
                                    <div
                                      className={`flex gap-1 ${
                                        isMobile
                                          ? "opacity-100"
                                          : "opacity-0 group-hover:opacity-100"
                                      } transition-opacity`}
                                    >
                                      <button
                                        onClick={() => openEdit(trx)}
                                        className="p-1 bg-yellow-100 hover:bg-yellow-200 rounded transition-colors"
                                        title="Edit"
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        onClick={() => handleDelete(trx.id)}
                                        className="p-1 bg-red-100 hover:bg-red-200 rounded transition-colors"
                                        title="Hapus"
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-6 flex-wrap">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ⬅️ Prev
                    </button>
                    <span className="text-sm text-gray-700 px-3 py-2 bg-gray-50 rounded-lg">
                      Halaman {page} dari {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next ➡️
                    </button>
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <AddTransactionModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddTransaction}
        categories={categories}
        accounts={accounts}
      />

      <EditTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        transaction={editing}
        categories={categories}
        onSaved={handleSaveEdit}
      />

      <CategoryModal
        open={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSuccess={handleCategorySuccess}
      />

      <AccountModal
        open={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        user={user}
        onSuccess={handleAccountSuccess}
      />
    </motion.div>
  );
}
