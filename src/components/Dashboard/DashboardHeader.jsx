import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";

export default function DashboardHeader({ 
  user, 
  navigate, 
  refreshData,
  setShowAccountModal,
  setShowCategoryModal,
  setAddModalOpen
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100 p-4 safe-area-inset-top">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 tracking-tight truncate">
              👋 Halo,{" "}
              <span className="text-blue-600">
                {user?.email?.split("@")[0]}
              </span>
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Selamat datang di dashboard keuanganmu
            </p>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={() => navigate("/utang")}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm text-sm"
            >
              💸 Hutang
            </button>
            <button
              onClick={() => setShowAccountModal(true)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors text-sm"
            >
              💳 Akun
            </button>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors text-sm"
            >
              📁 Kategori
            </button>
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition-colors text-sm"
            >
              ➕ Tambah
            </button>
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
              title="Refresh data"
            >
              🔄
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                toast.success("Berhasil keluar!");
                navigate("/");
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
            >
              🚪 Keluar
            </button>
          </div>

          {/* Mobile Affirmation - Only show in overview */}
          <div className="w-full bg-gradient-to-r from-green-100 to-teal-200 p-3 rounded-xl shadow-sm mt-2 md:hidden">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-800">
                💪 Semangat mengatur keuangan!
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Setiap transaksi penting dicatat
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}