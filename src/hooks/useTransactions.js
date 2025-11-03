// src/hooks/useTransactions.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getTransactions, saveTransaction, updateTransaction, deleteTransaction, updateAccountBalance } from '../services/TransactionService';
import { showSuccessToast, showErrorToast, showConfirmationToast } from '../utils/notifications.jsx';

export const useTransactions = (user) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fungsi untuk memuat transaksi
  const loadTransactions = useCallback(async (filters = {}) => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getTransactions({
        user_id: user.id,
        ...filters
      });
      
      setTransactions(result.data || []);
      return result;
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError(err.message);
      showErrorToast(`Gagal memuat transaksi: ${err.message}`);
      return { data: [], count: 0 };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fungsi untuk menambah transaksi
  const addTransaction = useCallback(async (transactionData) => {
    if (!user?.id) {
      showErrorToast('User tidak ditemukan');
      return null;
    }

    if (loading) {
      console.log("⚠️ Transaction submission blocked: already loading");
      return null;
    }

    setLoading(true);

    try {
      // Validasi data transaksi
      if (!transactionData.amount || parseFloat(transactionData.amount) <= 0) {
        throw new Error('Jumlah transaksi harus lebih besar dari 0');
      }

      if (!transactionData.category) {
        throw new Error('Kategori harus diisi');
      }

      if (!transactionData.date) {
        throw new Error('Tanggal harus diisi');
      }

      // Simpan transaksi ke database
      const savedTransaction = await saveTransaction({
        user_id: user.id,
        ...transactionData,
        amount: parseFloat(transactionData.amount),
        created_at: new Date().toISOString(),
      });

      // Update saldo akun jika akun dipilih
      if (transactionData.account_id) {
        await updateAccountBalance(transactionData);
      }

      // Tambahkan transaksi ke state
      setTransactions(prev => [savedTransaction[0], ...prev]);

      showSuccessToast('Transaksi berhasil ditambahkan!');
      return savedTransaction[0];
    } catch (err) {
      console.error('Error adding transaction:', err);
      showErrorToast(err.message || 'Gagal menambahkan transaksi');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, loading]);

  // Fungsi untuk mengupdate transaksi
  const updateTransactionData = useCallback(async (id, updatedData) => {
    if (!user?.id) {
      showErrorToast('User tidak ditemukan');
      return null;
    }

    setLoading(true);

    try {
      // Dapatkan transaksi lama untuk perbandingan
      const { data: oldTransaction, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Update transaksi di database
      const updatedTransaction = await updateTransaction(id, {
        ...updatedData,
        amount: parseFloat(updatedData.amount),
      });

      // Update saldo akun jika akun dipilih
      if (updatedData.account_id || oldTransaction.account_id) {
        await updateAccountBalance(updatedData, true, oldTransaction);
      }

      // Update transaksi di state
      setTransactions(prev => 
        prev.map(t => t.id === id ? updatedTransaction : t)
      );

      showSuccessToast('Transaksi berhasil diperbarui!');
      return updatedTransaction;
    } catch (err) {
      console.error('Error updating transaction:', err);
      showErrorToast(err.message || 'Gagal memperbarui transaksi');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fungsi untuk menghapus transaksi
  const deleteTransactionData = useCallback(async (id) => {
    if (!user?.id) {
      showErrorToast('User tidak ditemukan');
      return false;
    }

    return new Promise((resolve) => {
      showConfirmationToast(
        'Yakin ingin menghapus transaksi ini?',
        async () => {
          setLoading(true);
          try {
            // Dapatkan transaksi untuk update saldo
            const { data: transaction, error: fetchError } = await supabase
              .from('transactions')
              .select('*')
              .eq('id', id)
              .single();

            if (fetchError) throw fetchError;

            // Hapus transaksi dari database
            await deleteTransaction(id);

            // Update saldo akun jika akun digunakan
            if (transaction.account_id) {
              const amount = parseFloat(transaction.amount);
              const { data: accountData, error: accountError } = await supabase
                .from('accounts')
                .select('balance')
                .eq('id', transaction.account_id)
                .single();
                
              if (!accountError && accountData) {
                let newBalance = parseFloat(accountData.balance || 0);
                if (transaction.type === 'income') {
                  newBalance -= amount; // Kurangi pemasukan
                } else {
                  newBalance += amount; // Tambahkan kembali pengeluaran
                }
                
                await supabase
                  .from('accounts')
                  .update({ balance: newBalance })
                  .eq('id', transaction.account_id);
              }
            }

            // Hapus transaksi dari state
            setTransactions(prev => prev.filter(t => t.id !== id));

            showSuccessToast('Transaksi berhasil dihapus!');
            resolve(true);
          } catch (err) {
            console.error('Error deleting transaction:', err);
            showErrorToast(err.message || 'Gagal menghapus transaksi');
            resolve(false);
          } finally {
            setLoading(false);
          }
        },
        () => resolve(false) // Batal
      );
    });
  }, [user]);

  // Fungsi untuk menghitung ringkasan keuangan
  const calculateFinancialSummary = useCallback(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
    const balance = totalIncome - totalExpense;
    
    // Hitung ringkasan harian
    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = transactions.filter(t => t.date === today);
    
    const todayIncome = todayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
    const todayExpense = todayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return {
      totalIncome,
      totalExpense,
      balance,
      todayIncome,
      todayExpense
    };
  }, [transactions]);

  return {
    transactions,
    loading,
    error,
    loadTransactions,
    addTransaction,
    updateTransactionData,
    deleteTransactionData,
    calculateFinancialSummary
  };
};