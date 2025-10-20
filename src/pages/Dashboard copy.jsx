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

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
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
     
    


     

    
    </div>
  );
}
