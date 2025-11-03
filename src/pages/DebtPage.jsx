import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDebts } from "../hooks/useDebts";
import DebtSummary from "../components/debt/DebtSummary";
import DebtCard from "../components/debt/DebtCard";
import DebtForm from "../components/debt/DebtForm";
import Calculator from "../components/Calculator";
import { useNavigate } from "react-router-dom";

const DebtPage = () => {
  const navigate = useNavigate();
  const { debts, stats, loading, addDebt, deleteDebt, addPayment } = useDebts();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all"); // all, debt, receivable
  const [showCalculator, setShowCalculator] = useState(false);

  const filteredDebts = debts.filter((debt) => {
    if (filter === "all") return true;
    return debt.type === filter;
  });

  const handleAddDebt = async (debtData) => {
    await addDebt(debtData);
    setShowForm(false);
  };

  const handleDeleteDebt = async (id) => {
    if (window.confirm("Yakin ingin menghapus utang ini?")) {
      await deleteDebt(id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              💰 Management Utang & Piutang
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola hutang dan piutang dengan mudah
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 sm:flex-none bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl font-semibold shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              🏠 Home
            </button>
            <button
              onClick={() => setShowCalculator(true)}
              className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-semibold shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              🧮 Kalkulator
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              ➕ Tambah
            </button>
          </div>
        </div>

        {/* Summary */}
        <DebtSummary stats={stats} />

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: "all", label: "Semua", emoji: "📊" },
            { key: "debt", label: "Hutang", emoji: "🔴" },
            { key: "receivable", label: "Piutang", emoji: "🟢" },
          ].map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                filter === key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {emoji} {label}
            </button>
          ))}
        </div>

        {/* Debt List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredDebts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200"
              >
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Belum ada{" "}
                  {filter === "all"
                    ? "utang/piutang"
                    : filter === "debt"
                    ? "hutang"
                    : "piutang"}
                </h3>
                <p className="text-gray-600 mb-4 max-w-sm mx-auto">
                  {filter === "all"
                    ? "Mulai catat hutang atau piutang pertama Anda"
                    : `Belum ada ${
                        filter === "debt" ? "hutang" : "piutang"
                      } yang tercatat`}
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Tambah{" "}
                  {filter === "all"
                    ? "Utang/Piutang"
                    : filter === "debt"
                    ? "Hutang"
                    : "Piutang"}
                </button>
              </motion.div>
            ) : (
              filteredDebts.map((debt) => (
                <motion.div
                  key={debt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <DebtCard
                    debt={debt}
                    onDelete={() => handleDeleteDebt(debt.id)}
                    onPayment={(paymentData) =>
                      addPayment(debt.id, paymentData)
                    }
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Add/Edit Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-lg w-full max-w-md"
              >
                <DebtForm
                  onSubmit={handleAddDebt}
                  onCancel={() => setShowForm(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Back Button */}
        <div className="fixed bottom-24 right-16 md:hidden">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-700 hover:bg-gray-800 text-white p-4 rounded-full shadow-lg transition-colors"
            title="Kembali ke Dashboard"
          >
            🏠
          </button>
        </div>
        
        {/* Floating Calculator Button for Mobile */}
        <button
          onClick={() => setShowCalculator(true)}
          className="fixed bottom-24 right-4 md:hidden bg-indigo-600 hover:bg-indigo-700 text-white p-5 rounded-full shadow-lg transition-colors z-40 min-h-[60px] min-w-[60px] flex items-center justify-center"
          title="Kalkulator"
        >
          🧮
        </button>
        
        {/* Calculator Modal */}
        {showCalculator && (
          <Calculator onClose={() => setShowCalculator(false)} />
        )}
      </div>
    </div>
  );
};

export default DebtPage;
