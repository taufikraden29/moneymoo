import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabaseClient";

export default function AddAccountForm({ onSuccess }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("cash");
  const [accountNumber, setAccountNumber] = useState("");
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return toast.error("Nama akun wajib diisi!");
    if (type === "bank" && !accountNumber)
      return toast.error("Nomor rekening wajib diisi untuk akun bank!");

    setLoading(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      const userId = user?.user?.id;

      const { error } = await supabase.from("accounts").insert([
        {
          user_id: userId,
          name,
          type,
          account_number: type === "bank" ? accountNumber : null,
          balance: Number(balance) || 0,
        },
      ]);

      if (error) throw error;

      toast.success("Akun berhasil ditambahkan!");
      setName("");
      setType("cash");
      setAccountNumber("");
      setBalance("");
      onSuccess && onSuccess();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-xl p-6 space-y-4 border border-gray-100"
    >
      <h2 className="text-lg font-semibold text-gray-700">Tambah Akun</h2>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Nama Akun</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: BCA, Tunai, OVO"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Tipe Akun</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          <option value="cash">Tunai</option>
          <option value="bank">Bank</option>
          <option value="ewallet">E-Wallet</option>
        </select>
      </div>

      {type === "bank" && (
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Nomor Rekening
          </label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Masukkan nomor rekening bank"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>
      )}

      <div>
        <label className="block text-sm text-gray-600 mb-1">Saldo Awal</label>
        <input
          type="number"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          placeholder="Contoh: 1000000"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60 font-medium"
      >
        {loading ? "Menyimpan..." : "Simpan Akun"}
      </button>
    </form>
  );
}
