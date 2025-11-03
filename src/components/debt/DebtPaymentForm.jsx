import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const DebtPaymentForm = ({ debt, onClose, onPayment }) => {
    const [form, setForm] = useState({
        payment_date: new Date().toISOString().split('T')[0],
        amount: '',
        account_id: '',
        payment_method: 'transfer',
        description: ''
    });

    const [accounts, setAccounts] = useState([]);
    const [maxAmount, setMaxAmount] = useState(debt.remaining_amount);

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        const { data } = await supabase
            .from('accounts')
            .select('*')
            .order('name');
        setAccounts(data || []);
    };

    const handleAmountChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        const numericValue = Number(value);

        if (numericValue > maxAmount) {
            toast.error(`Jumlah tidak boleh melebihi sisa hutang: Rp ${maxAmount.toLocaleString('id-ID')}`);
            return;
        }

        const formatted = new Intl.NumberFormat('id-ID').format(value);
        setForm({ ...form, amount: formatted });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.amount || !form.account_id) {
            toast.error('Jumlah dan akun pembayaran wajib diisi');
            return;
        }

        const paymentData = {
            debt_id: debt.id,
            payment_date: form.payment_date,
            amount: Number(form.amount.replace(/\D/g, '')),
            account_id: form.account_id,
            payment_method: form.payment_method,
            description: form.description || `Pembayaran ${debt.type === 'debt' ? 'hutang' : 'piutang'}`
        };

        try {
            await onPayment(paymentData);
            onClose();
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            // Tidak perlu menutup form jika terjadi error
            // onClose() akan dipanggil hanya jika berhasil
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    💳 Bayar {debt.type === 'debt' ? 'Hutang' : 'Piutang'}
                </h2>

                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <p className="text-sm text-gray-600">Kepada: {debt.contact_name}</p>
                    <p className="text-lg font-bold text-gray-800">
                        Sisa: Rp {debt.remaining_amount.toLocaleString('id-ID')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Payment Date */}
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Tanggal Bayar</label>
                        <input
                            type="date"
                            value={form.payment_date}
                            onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-gray-700 font-medium">Jumlah Bayar</label>
                            <div className="flex gap-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const oneQuarter = Math.floor(debt.remaining_amount / 4);
                                        const formatted = new Intl.NumberFormat('id-ID').format(oneQuarter);
                                        setForm({ ...form, amount: formatted });
                                        toast.success('1/4 nominal disalin!');
                                    }}
                                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-lg transition-colors"
                                >
                                    1/4
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const halfAmount = Math.floor(debt.remaining_amount / 2);
                                        const formatted = new Intl.NumberFormat('id-ID').format(halfAmount);
                                        setForm({ ...form, amount: formatted });
                                        toast.success('1/2 nominal disalin!');
                                    }}
                                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-lg transition-colors"
                                >
                                    1/2
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const formatted = new Intl.NumberFormat('id-ID').format(debt.remaining_amount);
                                        setForm({ ...form, amount: formatted });
                                        toast.success('Nominal penuh disalin!');
                                    }}
                                    className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-lg transition-colors"
                                >
                                    Penuh
                                </button>
                            </div>
                        </div>
                        
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                            <input
                                type="text"
                                value={form.amount}
                                onChange={handleAmountChange}
                                className="w-full border border-gray-300 rounded-xl pl-12 pr-24 py-3 text-right text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const formatted = new Intl.NumberFormat('id-ID').format(debt.remaining_amount);
                                    setForm({ ...form, amount: formatted });
                                    toast.success('Nominal disalin!');
                                }}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                            >
                                Salin
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Maksimal: Rp {maxAmount.toLocaleString('id-ID')}
                        </p>
                    </div>

                    {/* Account */}
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Akun Pembayaran</label>
                        <select
                            value={form.account_id}
                            onChange={(e) => setForm({ ...form, account_id: e.target.value })}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Pilih akun...</option>
                            {accounts.map(account => (
                                <option key={account.id} value={account.id}>
                                    {account.name} - Rp {account.balance?.toLocaleString('id-ID')}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Metode Pembayaran</label>
                        <select
                            value={form.payment_method}
                            onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="cash">Tunai</option>
                            <option value="transfer">Transfer</option>
                            <option value="debit_card">Kartu Debit</option>
                            <option value="credit_card">Kartu Kredit</option>
                            <option value="other">Lainnya</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Keterangan</label>
                        <input
                            type="text"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Keterangan pembayaran"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                        >
                            💳 Bayar
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default DebtPaymentForm;