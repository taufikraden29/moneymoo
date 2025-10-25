import { useState, useEffect } from 'react';
import { debtService } from '../services/debtService';
import toast from 'react-hot-toast';

export const useDebts = () => {
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);

    const loadDebts = async () => {
        setLoading(true);
        try {
            const [debtsData, statsData] = await Promise.all([
                debtService.getDebts(),
                debtService.getDebtStats()
            ]);
            setDebts(debtsData);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading debts:', error);
            toast.error('Gagal memuat data utang');
        } finally {
            setLoading(false);
        }
    };

    const addDebt = async (debtData) => {
        try {
            const newDebt = await debtService.createDebt(debtData);
            setDebts(prev => [newDebt, ...prev]);
            await loadDebts(); // Reload untuk update stats
            toast.success('Utang berhasil ditambahkan');
            return newDebt;
        } catch (error) {
            console.error('Error adding debt:', error);
            toast.error('Gagal menambahkan utang');
            throw error;
        }
    };

    const updateDebt = async (id, updates) => {
        try {
            const updatedDebt = await debtService.updateDebt(id, updates);
            setDebts(prev => prev.map(debt =>
                debt.id === id ? updatedDebt : debt
            ));
            await loadDebts(); // Reload untuk update stats
            toast.success('Utang berhasil diperbarui');
            return updatedDebt;
        } catch (error) {
            console.error('Error updating debt:', error);
            toast.error('Gagal memperbarui utang');
            throw error;
        }
    };

    const deleteDebt = async (id) => {
        try {
            await debtService.deleteDebt(id);
            setDebts(prev => prev.filter(debt => debt.id !== id));
            await loadDebts(); // Reload untuk update stats
            toast.success('Utang berhasil dihapus');
        } catch (error) {
            console.error('Error deleting debt:', error);
            toast.error('Gagal menghapus utang');
            throw error;
        }
    };

    const addPayment = async (paymentData) => {
        try {
            const newPayment = await debtService.createDebtPayment(paymentData);

            // Update local state untuk remaining amount
            setDebts(prev => prev.map(debt => {
                if (debt.id === paymentData.debt_id) {
                    return {
                        ...debt,
                        remaining_amount: debt.remaining_amount - paymentData.amount
                    };
                }
                return debt;
            }));

            await loadDebts(); // Reload untuk data terbaru
            toast.success('Pembayaran berhasil dicatat');
            return newPayment;
        } catch (error) {
            console.error('Error adding payment:', error);
            toast.error('Gagal mencatat pembayaran');
            throw error;
        }
    };

    useEffect(() => {
        loadDebts();
    }, []);

    return {
        debts,
        stats,
        loading,
        loadDebts,
        addDebt,
        updateDebt,
        deleteDebt,
        addPayment
    };
};