import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Ambil user login
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        navigate("/"); // redirect ke login jika tidak ada user
        return;
      }
      setUser(data.user);
    };
    fetchUser();
  }, [navigate]);

  // Ambil transaksi user
  useEffect(() => {
    if (user) fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      console.error("Gagal memuat transaksi:", error.message);
      return;
    }
    setTransactions(data || []);
  };

  // Hitung ringkasan
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  // Logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout gagal:", error.message);
      alert("Gagal keluar. Coba lagi!");
    } else {
      navigate("/"); // arahkan ke login page
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}

      <header className=" items-center mb-8">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold text-gray-800">👋 Halo</h1>
          <div className="">
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow"
            >
              Keluar
            </button>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">
          <span className="text-blue-600">{user?.email}</span>
        </h1>
      </header>

      {/* Tombol Tambah */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/add-transaction")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
        >
          + Tambah Transaksi
        </button>
        <button
          onClick={() => navigate("/categories")}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow ml-2"
        >
          Kategori
        </button>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition">
          <h2 className="text-gray-500 text-sm font-semibold">Pemasukan</h2>
          <p className="text-green-600 text-2xl font-bold mt-1">
            Rp {totalIncome.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition">
          <h2 className="text-gray-500 text-sm font-semibold">Pengeluaran</h2>
          <p className="text-red-500 text-2xl font-bold mt-1">
            Rp {totalExpense.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition">
          <h2 className="text-gray-500 text-sm font-semibold">Saldo</h2>
          <p
            className={`text-2xl font-bold mt-1 ${
              balance >= 0 ? "text-blue-600" : "text-red-600"
            }`}
          >
            Rp {balance.toLocaleString("id-ID")}
          </p>
        </div>
      </section>

      {/* Transaction Table */}
      <section className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Transaksi Terbaru
        </h2>

        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Belum ada transaksi 📝
          </p>
        ) : (
          <div className="divide-y divide-gray-200">
            {transactions.map((trx) => (
              <div
                key={trx.id}
                className="flex justify-between items-center py-3 hover:bg-gray-50 px-2 rounded transition"
              >
                <div>
                  <p className="font-medium text-gray-800">{trx.category}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(trx.date).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    • {trx.description || "-"}
                  </p>
                </div>
                <p
                  className={`font-semibold ${
                    trx.type === "income" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {trx.type === "income" ? "+" : "-"} Rp{" "}
                  {Number(trx.amount).toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
