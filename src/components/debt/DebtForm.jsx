import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const DebtForm = ({ onSubmit, onCancel, initialData }) => {
    const [form, setForm] = useState({
        type: 'debt',
        contact_name: '',
        contact_phone: '',
        description: '',
        total_amount: '',
        due_date: '',
        ...initialData
    });

    const [accounts, setAccounts] = useState([]);

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

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.contact_name || !form.total_amount) {
            toast.error('Nama kontak dan jumlah wajib diisi');
            return;
        }

        const submitData = {
            ...form,
            total_amount: Number(form.total_amount.replace(/\D/g, '')),
            remaining_amount: Number(form.total_amount.replace(/\D/g, '')),
            due_date: form.due_date || null
        };

        onSubmit(submitData);
    };

    const handleAmountChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        const formatted = new Intl.NumberFormat('id-ID').format(value);
        setForm({ ...form, total_amount: formatted });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={onCancel}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    {initialData ? 'Edit Utang' : 'Tambah Utang/Piutang'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Type Selection */}
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Jenis</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, type: 'debt' })}
                                className={`py-3 px-4 rounded-xl border-2 transition-all ${form.type === 'debt'
                                        ? 'border-red-500 bg-red-50 text-red-700'
                                        : 'border-gray-200 text-gray-600'
                                    }`}
                            >
                                🔴 Hutang
                            </button>
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, type: 'receivable' })}
                                className={`py-3 px-4 rounded-xl border-2 transition-all ${form.type === 'receivable'
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-200 text-gray-600'
                                    }`}
                            >
                                🟢 Piutang
                            </button>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">
                            Nama {form.type === 'debt' ? 'Pemberi Hutang' : 'Peminjam'}
                        </label>
                        <input
                            type="text"
                            value={form.contact_name}
                            onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Nama ${form.type === 'debt' ? 'pemberi hutang' : 'peminjam'}`}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Nomor Telepon</label>
                        <input
                            type="tel"
                            value={form.contact_phone}
                            onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="08123456789"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Deskripsi</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Deskripsi utang/piutang"
                            rows="3"
                            required
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Jumlah Total</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                            <input
                                type="text"
                                value={form.total_amount}
                                onChange={handleAmountChange}
                                className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-right text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                                required
                            />
                        </div>
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Tanggal Jatuh Tempo</label>
                        <input
                            type="date"
                            value={form.due_date}
                            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                        >
                            {initialData ? 'Update' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default DebtForm;