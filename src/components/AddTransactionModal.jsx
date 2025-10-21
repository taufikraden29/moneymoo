import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function AddTransactionModal({ open, onClose, onAdd }) {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    date: today,
    type: "expense",
    category: "",
    description: "",
    amount: "",
  });

  // Ambil user + data kategori & akun saat modal dibuka
  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user;
      setUser(currentUser);

      if (currentUser) {
        const [{ data: cats }, { data: accs }] = await Promise.all([
          supabase
            .from("categories")
            .select("*")
            .eq("user_id", currentUser.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("accounts")
            .select("*")
            .eq("user_id", currentUser.id)
            .order("created_at", { ascending: false }),
        ]);

        setCategories(cats || []);
        setAccounts(accs || []);
      }
    };

    loadData();
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "amount") {
      const numeric = value.replace(/\D/g, "");
      const formatted = new Intl.NumberFormat("id-ID").format(numeric);
      setForm({ ...form, [name]: formatted });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.category || !form.amount || !form.date || !accountId)
      return toast.error("⚠️ Isi semua kolom wajib!");

    const cleanAmount = Number(form.amount.replace(/\D/g, ""));
    const transactionPayload = {
      user_id: user.id,
      account_id: accountId,
      ...form,
      amount: cleanAmount,
      created_at: new Date(),
    };

    onAdd?.(transactionPayload);
    setForm({
      date: today,
      type: "expense",
      category: "",
      description: "",
      amount: "",
    });
    setAccountId("");
    onClose();
  };

  if (!open) return null;

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal Content */}
        <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95 translate-y-4"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-4"
          >
            <Dialog.Panel className="w-full max-w-md sm:max-w-lg lg:max-w-xl bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-gray-100 overflow-y-auto max-h-[90vh]">
              {/* Judul */}
              <Dialog.Title className="text-center text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
                💰 Tambah Transaksi
              </Dialog.Title>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 🔹 Tanggal */}
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    max={today}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                {/* 🔹 Akun */}
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-1">Akun</label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Pilih Akun</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}{" "}
                        {acc.type === "bank" && acc.bank_number
                          ? `(${acc.bank_number})`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 🔹 Jenis + Kategori */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Jenis
                    </label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="expense">Pengeluaran</option>
                      <option value="income">Pemasukan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Kategori
                    </label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Pilih kategori</option>
                      {categories
                        .filter((c) => c.type === form.type)
                        .map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* 🔹 Deskripsi */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Deskripsi
                  </label>
                  <input
                    type="text"
                    name="description"
                    placeholder="Contoh: makan siang / gaji bulan ini"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                {/* 🔹 Jumlah */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Jumlah (Rp)
                  </label>
                  <input
                    type="text"
                    name="amount"
                    placeholder="0"
                    value={form.amount}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-right focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                {/* 🔹 Tombol Simpan */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition text-lg"
                >
                  Simpan Transaksi
                </button>
              </form>

              {/* Tombol Tutup */}
              <div className="flex justify-center sm:justify-end mt-6">
                <button
                  onClick={onClose}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition text-sm sm:text-base"
                >
                  Tutup
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
