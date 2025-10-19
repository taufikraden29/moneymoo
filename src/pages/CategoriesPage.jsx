import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  getCategories,
  addCategory,
  deleteCategory,
} from "../pages/CategoryService";

export default function CategoriesPage() {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user);
      if (data.session?.user) {
        loadCategories(data.session.user.id);
      }
    });
  }, []);

  const loadCategories = async (uid) => {
    const data = await getCategories(uid);
    setCategories(data);
  };

  const handleAdd = async () => {
    if (!name) return alert("Masukkan nama kategori!");
    await addCategory({ user_id: user.id, name, type });
    setName("");
    loadCategories(user.id);
  };

  const handleDelete = async (id) => {
    if (confirm("Hapus kategori ini?")) {
      await deleteCategory(id);
      loadCategories(user.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          📂 Daftar Kategori
        </h2>

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
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition"
          >
            + Tambah
          </button>
        </div>

        {/* List kategori */}
        <ul className="divide-y divide-gray-200">
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
                      cat.type === "income" ? "text-green-600" : "text-red-500"
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
      </div>
    </div>
  );
}
