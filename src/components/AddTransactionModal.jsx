import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import TransactionForm from "./TransactionForm";

const AddTransactionModal = ({ open, onClose, onAdd, categories, accounts }) => {
  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                ➕ Tambah Transaksi
              </h2>

              <TransactionForm
                categories={categories}
                accounts={accounts}
                isEditing={false}
                onSubmit={onAdd}
                onCancel={onClose}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddTransactionModal;