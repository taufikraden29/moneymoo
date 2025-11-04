import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TransactionForm from "./TransactionForm";
import { formatRupiah } from "../utils/formatters";

export default function EditTransactionModal({
  open,
  onClose,
  transaction,
  categories = [],
  onSaved,
}) {
  const [isAmountChanged, setIsAmountChanged] = useState(false);
  const [originalAmount, setOriginalAmount] = useState(transaction?.amount || 0);

  if (!open) return null;

  // Calculate amount change when transaction is updated
  const calculateAmountChange = (newAmount) => {
    const original = originalAmount;
    const updated = typeof newAmount === 'string' ? Number(newAmount.replace(/\D/g, '')) : newAmount;
    return updated - original;
  };

  const handleSave = async (transactionData) => {
    await onSaved(transactionData);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">✏️ Edit Transaksi</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Perbarui detail transaksi
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-blue-200 text-xl transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <TransactionForm
                transaction={transaction}
                categories={categories}
                accounts={[]} // For editing, we're not passing accounts since they're not changed
                isEditing={true}
                onSubmit={handleSave}
                onCancel={onClose}
              />

              {/* Original Transaction Info */}
              {transaction && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-700 text-sm mb-2">
                    📋 Info Asli Transaksi
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Tanggal:</span>
                      <p>{new Date(transaction.date).toLocaleDateString('id-ID')}</p>
                    </div>
                    <div>
                      <span className="font-medium">Kategori:</span>
                      <p>{transaction.category}</p>
                    </div>
                    <div>
                      <span className="font-medium">Jumlah:</span>
                      <p className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {formatRupiah(transaction.amount)}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Deskripsi:</span>
                      <p className="truncate">{transaction.description || '-'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}