import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";

export default function AccountModal({ open, onClose, user }) {
  const [accounts, setAccounts] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("cash");
  const [bankNumber, setBankNumber] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) fetchAccounts();
  }, [open, user]);

  const fetchAccounts = async () => {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error) setAccounts(data);
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Nama akun wajib diisi!");
    setLoading(true);
    try {
      const { error } = await supabase.from("accounts").insert([
        {
          user_id: user.id,
          name,
          type,
          bank_number: type === "bank" ? bankNumber : null,
        },
      ]);
      if (error) throw error;
      toast.success("Akun berhasil ditambahkan!");
      setName("");
      setType("cash");
      setBankNumber("");
      fetchAccounts();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus akun ini?")) return;
    const { error } = await supabase.from("accounts").delete().eq("id", id);
    if (error) toast.error("Gagal menghapus akun!");
    else {
      toast.success("Akun dihapus!");
      fetchAccounts();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in duration-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          💳 Kelola Akun
        </h2>

        <form onSubmit={handleAddAccount} className="space-y-4">
          <input
            type="text"
            placeholder="Nama Akun (contoh: BCA, Tunai, GoPay)"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="cash">Tunai</option>
            <option value="bank">Bank</option>
            <option value="ewallet">E-Wallet</option>
          </select>
          {type === "bank" && (
            <input
              type="text"
              placeholder="Nomor Rekening Bank"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
              value={bankNumber}
              onChange={(e) => setBankNumber(e.target.value)}
            />
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Menyimpan..." : "Tambah Akun"}
          </button>
        </form>

        {/* Daftar Akun */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            Daftar Akun
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {accounts.length === 0 ? (
              <p className="text-gray-400 text-sm">Belum ada akun</p>
            ) : (
              accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex justify-between items-center border rounded-lg px-3 py-2 hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-700">{acc.name}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {acc.type}{" "}
                      {acc.type === "bank" && acc.bank_number
                        ? `• ${acc.bank_number}`
                        : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(acc.id)}
                    className="text-red-500 text-xs hover:text-red-700"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
