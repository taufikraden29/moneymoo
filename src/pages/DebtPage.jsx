import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebts } from '../hooks/useDebts';
import DebtSummary from '../components/debt/DebtSummary';
import DebtCard from '../components/debt/DebtCard';
import DebtForm from '../components/debt/DebtForm';

const DebtPage = () => {
  const { debts, stats, loading, addDebt, deleteDebt, addPayment } = useDebts();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all'); // all, debt, receivable

  const filteredDebts = debts.filter(debt => {
    if (filter === 'all') return true;
    return debt.type === filter;
  });

  const handleAddDebt = async (debtData) => {
    await addDebt(debtData);
    setShowForm(false);
  };

  const handleDeleteDebt = async (id) => {
    if (window.confirm('Yakin ingin menghapus utang ini?')) {
      await deleteDebt(id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              💰 Management Utang & Piutang
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola hutang dan piutang dengan mudah
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-colors"
          >
            ➕ Tambah Baru
          </button>
        </div>

        {/* Summary */}
        <DebtSummary stats={stats} />

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'Semua', emoji: '📊' },
            { key: 'debt', label: 'Hutang', emoji: '🔴' },
            { key: 'receivable', label: 'Piutang', emoji: '🟢' }
          ].map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200"
              >
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Belum ada {filter === 'all' ? 'utang/piutang' : filter === 'debt' ? 'hutang' : 'piutang'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {filter === 'all'
                    ? 'Mulai catat hutang atau piutang pertama Anda'
                    : `Belum ada ${filter === 'debt' ? 'hutang' : 'piutang'} yang tercatat`}
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Tambah {filter === 'all' ? 'Utang/Piutang' : filter === 'debt' ? 'Hutang' : 'Piutang'}
                </button>
              </motion.div>
            ) : (
              filteredDebts.map((debt) => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
                  onUpdate={() => { }} // Implement if needed
                  onDelete={handleDeleteDebt}
                  onPayment={addPayment}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Add/Edit Form Modal */}
        <AnimatePresence>
          {showForm && (
            <DebtForm
              onSubmit={handleAddDebt}
              onCancel={() => setShowForm(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DebtPage;