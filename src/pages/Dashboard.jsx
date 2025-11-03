import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import EditTransactionModal from "../components/EditTransactionModal";
import ReportChart from "../components/ReportChart";
import CategoryModal from "../components/CategoryModal";
import AddTransactionModal from "../components/AddTransactionModal";
import AffirmationCard from "@/components/AffirmationCard";
import AccountModal from "../components/AccountModal";
import StatusCardAccount from "../components/StatusCardAccount";
import { motion, AnimatePresence } from "framer-motion";
import FilterSection from "../components/Dashboard/FilterSection";
import TransactionList from "../components/Dashboard/TransactionList";
import Pagination from "../components/Dashboard/Pagination";
import MobileNav from "../components/Dashboard/MobileNav";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import { useTransactions } from "../hooks/useTransactions";
import FinancialSummarySection from "../components/Dashboard/FinancialSummarySection";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

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

  // Tambahkan state loading lokal untuk operasi umum
  const [loading, setLoading] = useState(false);

  // Gunakan hook useTransactions
  const {
    transactions,
    loadTransactions: hookLoadTransactions,
    addTransaction,
    updateTransactionData,
    deleteTransactionData,
    calculateFinancialSummary
  } = useTransactions(user);

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

  // Load transactions with pagination and filters using the hook
  const loadTransactionsWithFilters = useCallback(async () => {
    if (!user) return;

    // Gunakan fungsi dari hook useTransactions dengan filter
    const filters = {
      from,
      to,
      type: filterType,
      category: filterCategory,
      q,
      limit,
      offset: (page - 1) * limit
    };
    
    await hookLoadTransactions(filters);
  }, [user, from, to, filterType, filterCategory, q, page, limit, hookLoadTransactions]);

  // 🔥 OPTIMIZED: Load all data when user changes
  useEffect(() => {
    if (user) {
      Promise.all([
        loadCategories(),
        loadAccounts(),
        loadTransactionsWithFilters(),
      ]);
    }
  }, [
    user,
    loadCategories,
    loadAccounts,
    loadTransactionsWithFilters,
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
  const refreshData = useCallback(async () => {
    console.log("🔄 Manual refresh triggered");
    await Promise.all([
      loadCategories(),
      loadAccounts(),
      loadTransactionsWithFilters(),
    ]);
  }, [loadCategories, loadAccounts, loadTransactionsWithFilters]);

  // Gunakan fungsi dari hook
  const handleAddTransaction = async (transactionData) => {
    const result = await addTransaction(transactionData);
    if (result) {
      setAddModalOpen(false);
      await refreshData(); // Refresh data setelah penambahan berhasil
    }
  };

  const handleDelete = async (id) => {
    const success = await deleteTransactionData(id);
    if (success) {
      await refreshData(); // Refresh data setelah penghapusan berhasil
    }
  };

  const openEdit = (trx) => {
    setEditing(trx);
    setModalOpen(true);
  };

  const handleSaveEdit = async (updatedPayload) => {
    const result = await updateTransactionData(editing.id, updatedPayload);
    if (result) {
      setModalOpen(false);
      await refreshData(); // Refresh data setelah update berhasil
    }
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

  // Gunakan fungsi dari hook untuk menghitung ringkasan keuangan
  const financialData = useMemo(() => {
    return calculateFinancialSummary();
  }, [calculateFinancialSummary]);

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
      <DashboardHeader
        user={user}
        navigate={navigate}
        refreshData={refreshData}
        setShowAccountModal={setShowAccountModal}
        setShowCategoryModal={setShowCategoryModal}
        setAddModalOpen={setAddModalOpen}
      />
      
      {/* Mobile Affirmation - Only show in overview */}
      {isMobile && shouldShowSection("overview") && (
        <div className="max-w-7xl mx-auto px-4 mt-2">
          <div className="w-full bg-gradient-to-r from-green-100 to-teal-200 p-3 rounded-xl shadow-sm">
            <AffirmationCard />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Mobile Navigation */}
        {isMobile && (
          <MobileNav
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            refreshData={refreshData}
            setAddModalOpen={setAddModalOpen}
            setShowFilters={setShowFilters}
            navigate={navigate}
          />
        )}

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
                <FinancialSummarySection
                  user={user}
                  selectedAccount={selectedAccount}
                  transactions={transactions}
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
                <FilterSection
                  showFilters={showFilters}
                  isMobile={isMobile}
                  from={from}
                  to={to}
                  filterType={filterType}
                  filterCategory={filterCategory}
                  q={q}
                  categories={categories}
                  setFrom={setFrom}
                  setTo={setTo}
                  setFilterType={setFilterType}
                  setFilterCategory={setFilterCategory}
                  setQ={setQ}
                />

                {/* Transactions List */}
                <TransactionList
                  transactions={transactions}
                  groupedTransactions={groupedTransactions}
                  loading={loading}
                  openEdit={openEdit}
                  handleDelete={handleDelete}
                  isMobile={isMobile}
                />

                {/* Pagination */}
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  setPage={setPage}
                />
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
