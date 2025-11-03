// src/components/TransactionNotification.jsx
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const TransactionNotification = ({ transaction, type, amount }) => {
  useEffect(() => {
    if (transaction) {
      const formattedAmount = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(amount);
      
      toast.success(
        `✅ Transaksi ${type === 'income' ? 'pemasukan' : 'pengeluaran'} sebesar ${formattedAmount} berhasil disimpan!`
      );
    }
  }, [transaction, type, amount]);

  return null; // This component doesn't render anything
};

export default TransactionNotification;