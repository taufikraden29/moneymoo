import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

export default function AddAccountForm({ onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    type: "cash",
    accountNumber: "",
    balance: "",
    bankName: ""
  });
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
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
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("User tidak terautentikasi");
      }

      const accountData = {
        user_id: user.id,
        name: form.name.trim(),
        type: form.type,
        account_number: form.type === "bank" ? form.accountNumber.trim() : null,
        bank_name: form.type === "bank" ? form.bankName : null,
        balance: Number(form.balance.replace(/\D/g, "")) || 0,
        created_at: new Date().toISOString()
      };

      console.log("📤 Creating account:", accountData);

      const { data, error } = await supabase
        .from("accounts")
        .insert([accountData])
        .select()
        .single();

      if (error) {
        console.error("❌ Supabase error:", error);
        throw error;
      }

      toast.success("✅ Akun berhasil ditambahkan!");

      // Reset form
      setForm({
        name: "",
        type: "cash",
        accountNumber: "",
        balance: "",
        bankName: ""
      });

      onSuccess && onSuccess(data);
    } catch (err) {
      console.error("❌ Error creating account:", err);
      toast.error(`❌ Gagal menambahkan akun: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    if (field === "balance") {
      // Format currency input
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
      name: bankName // Auto-fill name dengan nama bank
    }));
  };

  const getBalanceValue = () => {
    return form.balance ? Number(form.balance.replace(/\D/g, "")) : 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">➕ Tambah Akun Baru</h2>
        <p className="text-gray-600">Kelola berbagai jenis akun keuangan Anda</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Tipe Akun */}
        <div>
          <label className="block text-gray-700 mb-3 font-semibold">
            💰 Tipe Akun
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {accountTypes.map((accountType) => (
              <button
                key={accountType.value}
                type="button"
                onClick={() => handleChange("type", accountType.value)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${form.type === accountType.value
                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                  }`}
              >
                <div className="text-lg mb-1">{accountType.icon}</div>
                {accountType.label}
              </button>
            ))}
          </div>
        </div>

        {/* Nama Bank (hanya untuk bank) */}
        <AnimatePresence>
          {form.type === "bank" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-gray-700 mb-2 font-semibold">
                🏦 Pilih Bank
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {popularBanks.slice(0, 6).map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => handleBankSelect(bank)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${form.bankName === bank
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
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nama Akun */}
        <div>
          <label className="block text-gray-700 mb-2 font-semibold">
            📛 Nama Akun
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
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Nomor Rekening (hanya untuk bank) */}
        <AnimatePresence>
          {form.type === "bank" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-gray-700 mb-2 font-semibold">
                🔢 Nomor Rekening
              </label>
              <input
                type="text"
                value={form.accountNumber}
                onChange={(e) => handleChange("accountNumber", e.target.value)}
                placeholder="Masukkan nomor rekening"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Saldo Awal */}
        <div>
          <label className="block text-gray-700 mb-2 font-semibold">
            💰 Saldo Awal
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
              Rp
            </span>
            <input
              type="text"
              value={form.balance}
              onChange={(e) => handleChange("balance", e.target.value)}
              placeholder="0"
              className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-right text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {form.balance && (
            <p className="text-sm text-gray-500 mt-2 text-right">
              Terbaca: <span className="font-mono">Rp {form.balance}</span>
            </p>
          )}
        </div>

        {/* Preview */}
        {form.name && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4"
          >
            <h4 className="font-semibold text-blue-800 mb-2">📋 Preview Akun</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <p><strong>Nama:</strong> {form.name}</p>
              <p><strong>Tipe:</strong> {accountTypes.find(a => a.value === form.type)?.label}</p>
              {form.type === "bank" && form.bankName && (
                <p><strong>Bank:</strong> {form.bankName}</p>
              )}
              {form.type === "bank" && form.accountNumber && (
                <p><strong>No. Rekening:</strong> {form.accountNumber}</p>
              )}
              <p><strong>Saldo Awal:</strong> Rp {getBalanceValue().toLocaleString("id-ID")}</p>
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className={`w-full py-4 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 ${loading
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

      {/* Quick Tips */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <h4 className="font-semibold text-gray-700 mb-2">💡 Tips</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Gunakan nama yang mudah dikenali</li>
          <li>• Pastikan saldo awal sesuai dengan kondisi aktual</li>
          <li>• Untuk akun bank, isi nomor rekening dengan benar</li>
          <li>• Anda bisa menambah akun lain kapan saja</li>
        </ul>
      </div>
    </motion.div>
  );
}