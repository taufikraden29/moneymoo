import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  getCategories,
  addCategory,
  deleteCategory,
} from "@/services/CategoryService";
import toast from "react-hot-toast";

export default function CategoryModal({ open, onClose }) {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [loading, setLoading] = useState(false);

  // ✅ Ambil user saat modal dibuka
  useEffect(() => {
    if (open) {
      supabase.auth.getSession().then(({ data }) => {
        const u = data.session?.user;
        setUser(u);
        if (u) loadCategories(u.id);
      });
    }
  }, [open]);

  const loadCategories = async (uid) => {
    const data = await getCategories(uid);
    setCategories(data);
  };

  const handleAdd = async () => {
    if (!name.trim()) return toast.error("Masukkan nama kategori!");
    if (!user) return toast.error("User tidak ditemukan.");

    setLoading(true);
    try {
      await addCategory({ user_id: user.id, name, type });
      toast.success("Kategori berhasil ditambahkan!");
      setName("");
      await loadCategories(user.id);
    } catch (err) {
      toast.error("Gagal menambah kategori!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    if (!user) return;

    toast(
      (t) => (
        <div className="flex flex-col items-start gap-3">
          <span>Hapus kategori ini?</span>
          <div className="flex gap-3 mt-2">
            <button
              onClick={async () => {
                try {
                  await deleteCategory(id);
                  await loadCategories(user.id);
                  toast.dismiss(t.id);
                  toast.success("Kategori berhasil dihapus!");
                } catch (err) {
                  toast.dismiss(t.id);
                  toast.error("Gagal menghapus kategori!");
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
      { duration: Infinity }
    );
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        {/* Background overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        </Transition.Child>

        {/* Modal panel wrapper */}
        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95 translate-y-4"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-4"
          >
            <Dialog.Panel className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl">
              <Dialog.Title className="text-2xl font-bold text-center mb-6">
                📂 Kelola Kategori
              </Dialog.Title>

              {/* Form tambah kategori */}
              <div className="flex flex-col md:flex-row gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Nama kategori..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="expense">Pengeluaran</option>
                  <option value="income">Pemasukan</option>
                </select>

                <button
                  onClick={handleAdd}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition disabled:opacity-60"
                >
                  {loading ? "Menambah..." : "+ Tambah"}
                </button>
              </div>

              {/* Daftar kategori */}
              <ul className="divide-y divide-gray-200 max-h-[300px] overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">
                    Belum ada kategori 😄
                  </p>
                ) : (
                  categories.map((cat) => (
                    <li
                      key={cat.id}
                      className="flex justify-between items-center py-3 px-2 hover:bg-gray-50 rounded-lg transition"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{cat.name}</p>
                        <p
                          className={`text-sm ${
                            cat.type === "income"
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {cat.type === "income" ? "Pemasukan" : "Pengeluaran"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="text-red-500 hover:text-red-700 transition"
                        title="Hapus kategori"
                      >
                        🗑️
                      </button>
                    </li>
                  ))
                )}
              </ul>

              {/* Tombol tutup */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={onClose}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
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
