import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  getCategories,
  addCategory,
  deleteCategory,
} from "@/services/CategoryService";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function CategoryModal({ open, onClose }) {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    type: "expense"
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("expense"); // "expense" or "income"

  // ✅ Ambil user saat modal dibuka
  useEffect(() => {
    if (open) {
      supabase.auth.getUser().then(({ data }) => {
        const u = data?.user;
        setUser(u);
        if (u) loadCategories(u.id);
      });
    } else {
      // Reset form ketika modal ditutup
      setForm({ name: "", type: "expense" });
    }
  }, [open]);

  const loadCategories = async (uid) => {
    try {
      const data = await getCategories(uid);
      setCategories(data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Gagal memuat kategori");
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("⚠️ Masukkan nama kategori!");
      return;
    }

    if (!user) {
      toast.error("❌ User tidak ditemukan.");
      return;
    }

    setLoading(true);
    try {
      await addCategory({
        user_id: user.id,
        name: form.name.trim(),
        type: form.type
      });
      toast.success("✅ Kategori berhasil ditambahkan!");
      setForm({ name: "", type: form.type }); // Reset nama saja, pertahankan type
      await loadCategories(user.id);
    } catch (err) {
      console.error("Error adding category:", err);
      toast.error("❌ Gagal menambah kategori!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id, categoryName) => {
    if (!user) return;

    toast(
      (t) => (
        <div className="flex flex-col items-start gap-3 p-3">
          <span className="text-gray-800 font-medium">
            Hapus kategori <strong>"{categoryName}"</strong>?
          </span>
          <p className="text-xs text-gray-600">
            Transaksi yang menggunakan kategori ini akan tetap ada, tetapi kategori akan diubah menjadi "Tanpa Kategori".
          </p>
          <div className="flex gap-2 w-full mt-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await deleteCategory(id);
                  await loadCategories(user.id);
                  toast.success("✅ Kategori berhasil dihapus!");
                } catch (err) {
                  console.error("Error deleting category:", err);
                  toast.error("❌ Gagal menghapus kategori!");
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

  const filteredCategories = categories.filter(cat => cat.type === activeTab);
  const expenseCategories = categories.filter(cat => cat.type === "expense");
  const incomeCategories = categories.filter(cat => cat.type === "income");

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
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        </Transition.Child>

        {/* Modal panel wrapper */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <Dialog.Title className="text-2xl font-bold">
                      📂 Kelola Kategori
                    </Dialog.Title>
                    <p className="text-blue-100 text-sm mt-1">
                      Kelola kategori pemasukan dan pengeluaran
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
                    onClick={() => {
                      setActiveTab("expense");
                      setForm(prev => ({ ...prev, type: "expense" }));
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "expense"
                        ? "bg-white text-red-600"
                        : "bg-red-500/50 text-red-100 hover:bg-red-500/70"
                      }`}
                  >
                    🛍️ Pengeluaran ({expenseCategories.length})
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("income");
                      setForm(prev => ({ ...prev, type: "income" }));
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "income"
                        ? "bg-white text-green-600"
                        : "bg-green-500/50 text-green-100 hover:bg-green-500/70"
                      }`}
                  >
                    💵 Pemasukan ({incomeCategories.length})
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {/* Add Category Form */}
                <form onSubmit={handleAdd} className="mb-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder={`Nama kategori ${activeTab === "income" ? "pemasukan" : "pengeluaran"}...`}
                        value={form.name}
                        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !form.name.trim()}
                      className={`px-6 py-3 rounded-xl font-semibold text-white transition-all ${loading || !form.name.trim()
                          ? "bg-gray-400 cursor-not-allowed"
                          : activeTab === "income"
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Menambah...
                        </div>
                      ) : (
                        "➕ Tambah"
                      )}
                    </button>
                  </div>
                </form>

                {/* Categories List */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-700 text-sm">
                    {activeTab === "income" ? "💵 Kategori Pemasukan" : "🛍️ Kategori Pengeluaran"}
                    <span className="text-gray-500 ml-2">({filteredCategories.length})</span>
                  </h3>

                  <AnimatePresence mode="wait">
                    {filteredCategories.length === 0 ? (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200"
                      >
                        <div className="text-4xl text-gray-300 mb-3">
                          {activeTab === "income" ? "💵" : "🛍️"}
                        </div>
                        <p className="text-gray-500 text-sm">
                          Belum ada kategori {activeTab === "income" ? "pemasukan" : "pengeluaran"}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Tambahkan kategori pertama Anda di atas
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-3"
                      >
                        {filteredCategories.map((category) => (
                          <motion.div
                            key={category.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${activeTab === "income"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-red-100 text-red-600"
                                }`}>
                                {activeTab === "income" ? "💵" : "🛍️"}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                  {category.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Dibuat: {new Date(category.created_at).toLocaleDateString('id-ID')}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDelete(category.id, category.name)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Hapus kategori"
                            >
                              🗑️
                            </button>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Quick Stats */}
                {categories.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h4 className="font-semibold text-blue-800 text-sm mb-2">
                      📊 Statistik Kategori
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="text-center p-2 bg-white rounded-lg border border-blue-100">
                        <p className="text-blue-600 font-medium">Total</p>
                        <p className="text-blue-800 font-bold text-lg">{categories.length}</p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg border border-green-100">
                        <p className="text-green-600 font-medium">Pemasukan</p>
                        <p className="text-green-800 font-bold text-lg">{incomeCategories.length}</p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg border border-red-100">
                        <p className="text-red-600 font-medium">Pengeluaran</p>
                        <p className="text-red-800 font-bold text-lg">{expenseCategories.length}</p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg border border-purple-100">
                        <p className="text-purple-600 font-medium">Rasio</p>
                        <p className="text-purple-800 font-bold text-lg">
                          {categories.length > 0
                            ? Math.round((incomeCategories.length / categories.length) * 100)
                            : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}