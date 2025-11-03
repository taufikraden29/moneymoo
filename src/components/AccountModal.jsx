import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

export default function AccountModal({ open, onClose, user, onSuccess }) {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    type: "cash",
    accountNumber: "",
    bankName: "", // 🔥 Opsional: Hanya untuk UI, tidak disimpan ke database
    balance: ""
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("add");

  const accountTypes = [
    { value: "cash", label: "💵 Tunai", icon: "💵" },
    { value: "bank", label: "🏦 Bank", icon: "🏦" },
    { value: "ewallet", label: "📱 E-Wallet", icon: "📱" },
    { value: "investment", label: "📈 Investasi", icon: "📈" },
    { value: "other", label: "💳 Lainnya", icon: "💳" }
  ];

  const popularBanks = [
    "BCA", "BRI", "Mandiri", "BNI", "BTN", "CIMB Niaga",
    "Bank Danamon", "Permata Bank", "OVO", "Gopay", "Dana",
    "LinkAja", "ShopeePay"
  ];

  useEffect(() => {
    if (open && user) {
      fetchAccounts();
      resetForm();
    }
  }, [open, user]);

  const fetchAccounts = async () => {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching accounts:", error);
      toast.error("Gagal memuat data akun");
    } else {
      setAccounts(data || []);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      type: "cash",
      accountNumber: "",
      bankName: "",
      balance: ""
    });
  };

  const handleChange = (field, value) => {
    if (field === "balance") {
      const numericValue = value.replace(/\D/g, "");
      const formatted = new Intl.NumberFormat("id-ID").format(numericValue);
      setForm(prev => ({ ...prev, [field]: formatted }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleBankSelect = (bankName) => {
    setForm(prev => ({
      ...prev,
      bankName,
      name: `Akun ${bankName}` // Auto-generate nama akun
    }));
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();

    // Validasi
    if (!form.name.trim()) {
      toast.error("⚠️ Nama akun wajib diisi!");
      return;
    }

    if (form.type === "bank" && !form.accountNumber.trim()) {
      toast.error("⚠️ Nomor rekening wajib diisi untuk akun bank!");
      return;
    }

    setLoading(true);

    try {
      // 🔥 SESUAIKAN DENGAN SCHEMA YANG ADA
      const accountData = {
        user_id: user.id,
        name: form.name.trim(),
        type: form.type,
        account_number: form.type === "bank" ? form.accountNumber.trim() : null,
        // 🔥 HAPUS bank_name karena tidak ada di schema
        balance: Number(form.balance.replace(/\D/g, "")) || 0,
        created_at: new Date().toISOString()
      };

      console.log("📤 Creating account with data:", accountData);

      const { data, error } = await supabase
        .from("accounts")
        .insert([accountData])
        .select()
        .single();

      if (error) {
        console.error("❌ Supabase error:", error);

        // Handle specific error cases
        if (error.code === '42501') {
          toast.error("❌ Tidak memiliki izin untuk menambah akun");
        } else if (error.code === '23505') {
          toast.error("❌ Akun dengan nama yang sama sudah ada");
        } else {
          throw error;
        }
        return;
      }

      console.log("✅ Account created successfully:", data);
      toast.success("✅ Akun berhasil ditambahkan!");

      resetForm();
      await fetchAccounts();
      setActiveTab("list");

      // Notify parent component
      if (onSuccess) {
        onSuccess(data);
      }

    } catch (err) {
      console.error("❌ Error adding account:", err);
      toast.error(`❌ Gagal menambahkan akun: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, accountName) => {
    toast(
      (t) => (
        <div className="flex flex-col items-start gap-3 p-2">
          <span className="text-gray-800 font-medium">
            Yakin ingin menghapus akun <strong>"{accountName}"</strong>?
          </span>
          <p className="text-xs text-gray-600">
            Transaksi yang terkait dengan akun ini akan tetap ada, tetapi tidak terhubung ke akun mana pun.
          </p>
          <div className="flex gap-2 w-full">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  const { error } = await supabase
                    .from("accounts")
                    .delete()
                    .eq("id", id);

                  if (error) {
                    console.error("❌ Error deleting account:", error);
                    throw error;
                  }

                  toast.success("✅ Akun berhasil dihapus!");
                  await fetchAccounts();

                  if (onSuccess) {
                    onSuccess();
                  }

                } catch (err) {
                  console.error("❌ Delete error:", err);
                  toast.error("❌ Gagal menghapus akun!");
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
        duration: 10000
      }
    );
  };

  const getAccountIcon = (type) => {
    const accountType = accountTypes.find(t => t.value === type);
    return accountType ? accountType.icon : "💳";
  };

  const formatBalance = (balance) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(balance || 0);
  };

  // Helper untuk menampilkan info bank (jika ada di data)
  const getBankInfo = (account) => {
    if (account.type === "bank" && account.account_number) {
      return `• ${account.account_number}`;
    }
    return "";
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">💳 Kelola Akun</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Tambah dan kelola akun keuangan Anda
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-blue-200 text-xl transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setActiveTab("add")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "add"
                      ? "bg-white text-blue-600"
                      : "bg-blue-500/50 text-blue-100 hover:bg-blue-500/70"
                    }`}
                >
                  ➕ Tambah Baru
                </button>
                <button
                  onClick={() => setActiveTab("list")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "list"
                      ? "bg-white text-blue-600"
                      : "bg-blue-500/50 text-blue-100 hover:bg-blue-500/70"
                    }`}
                >
                  📋 Daftar Akun ({accounts.length})
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === "add" ? (
                  <motion.div
                    key="add"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <form onSubmit={handleAddAccount} className="space-y-4">
                      {/* Tipe Akun */}
                      <div>
                        <label className="block text-gray-700 mb-3 font-semibold text-sm">
                          Jenis Akun
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {accountTypes.map((accountType) => (
                            <button
                              key={accountType.value}
                              type="button"
                              onClick={() => handleChange("type", accountType.value)}
                              className={`p-3 rounded-xl border-2 transition-all text-xs font-medium ${form.type === accountType.value
                                  ? "border-blue-500 bg-blue-50 text-blue-700"
                                  : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                                }`}
                            >
                              <div className="text-base mb-1">{accountType.icon}</div>
                              {accountType.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Nama Bank (hanya untuk UI, tidak disimpan) */}
                      {form.type === "bank" && (
                        <div>
                          <label className="block text-gray-700 mb-2 font-semibold text-sm">
                            Pilih Bank
                          </label>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {popularBanks.slice(0, 6).map((bank) => (
                              <button
                                key={bank}
                                type="button"
                                onClick={() => handleBankSelect(bank)}
                                className={`px-3 py-1 rounded-lg text-xs transition-colors ${form.bankName === bank
                                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                  }`}
                              >
                                {bank}
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            value={form.bankName}
                            onChange={(e) => handleChange("bankName", e.target.value)}
                            placeholder="Atau ketik nama bank lainnya..."
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}

                      {/* Nama Akun */}
                      <div>
                        <label className="block text-gray-700 mb-2 font-semibold text-sm">
                          Nama Akun
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          placeholder={
                            form.type === "cash" ? "Contoh: Dompet Tunai, Kas Kecil" :
                              form.type === "bank" ? "Contoh: BCA Savings, BRI Tabungan" :
                                form.type === "ewallet" ? "Contoh: OVO, Gopay, Dana" :
                                  "Contoh: Saham, Reksadana, Emas"
                          }
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      {/* Nomor Rekening (hanya untuk bank) */}
                      {form.type === "bank" && (
                        <div>
                          <label className="block text-gray-700 mb-2 font-semibold text-sm">
                            Nomor Rekening
                          </label>
                          <input
                            type="text"
                            value={form.accountNumber}
                            onChange={(e) => handleChange("accountNumber", e.target.value)}
                            placeholder="Masukkan nomor rekening"
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                      )}

                      {/* Saldo Awal */}
                      <div>
                        <label className="block text-gray-700 mb-2 font-semibold text-sm">
                          Saldo Awal
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                            Rp
                          </span>
                          <input
                            type="text"
                            value={form.balance}
                            onChange={(e) => handleChange("balance", e.target.value)}
                            placeholder="0"
                            className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-right font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        {form.balance && (
                          <p className="text-xs text-gray-500 mt-1 text-right">
                            Saldo: Rp {form.balance}
                          </p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        className={`w-full py-4 rounded-xl font-semibold text-white shadow-lg transition-all ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                          }`}
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Menyimpan...
                          </div>
                        ) : (
                          "💾 Simpan Akun"
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    {/* Daftar Akun */}
                    <div className="space-y-3">
                      {accounts.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-6xl text-gray-300 mb-4">💳</div>
                          <p className="text-gray-500 text-sm">Belum ada akun</p>
                          <button
                            onClick={() => setActiveTab("add")}
                            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                          >
                            ➕ Tambah Akun Pertama
                          </button>
                        </div>
                      ) : (
                        accounts.map((account) => (
                          <motion.div
                            key={account.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="text-2xl">
                                {getAccountIcon(account.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 truncate">
                                  {account.name}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span className="capitalize">{account.type}</span>
                                  {getBankInfo(account)}
                                </div>
                                <p className="text-sm font-medium text-blue-600 mt-1">
                                  {formatBalance(account.balance)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDelete(account.id, account.name)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus akun"
                            >
                              🗑️
                            </button>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}