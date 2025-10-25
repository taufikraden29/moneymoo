import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DebtPaymentForm from './DebtPaymentForm';

const DebtCard = ({ debt, onUpdate, onDelete, onPayment }) => {
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const progress = (debt.total_amount - debt.remaining_amount) / debt.total_amount * 100;
    const isOverdue = debt.due_date && new Date(debt.due_date) < new Date() && debt.status === 'active';

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return isOverdue ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
            case 'paid': return 'bg-green-100 text-green-800';
            case 'overdue': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeIcon = (type) => {
        return type === 'debt' ? '🔴' : '🟢';
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTypeIcon(debt.type)}</span>
                    <div>
                        <h3 className="font-semibold text-gray-800">{debt.contact_name}</h3>
                        <p className="text-sm text-gray-600">{debt.description}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(debt.status)}`}>
                        {debt.status === 'active' && isOverdue ? 'TERLAMBAT' : debt.status.toUpperCase()}
                    </span>
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        {showDetails ? '▲' : '▼'}
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress: {progress.toFixed(1)}%</span>
                    <span>Rp {(debt.total_amount - debt.remaining_amount).toLocaleString('id-ID')} / Rp {debt.total_amount.toLocaleString('id-ID')}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Details */}
            {showDetails && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-gray-100 pt-3 space-y-2"
                >
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">Sisa:</span>
                            <p className="font-semibold text-lg text-red-600">
                                Rp {debt.remaining_amount.toLocaleString('id-ID')}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-500">Jatuh Tempo:</span>
                            <p className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                                {debt.due_date ? new Date(debt.due_date).toLocaleDateString('id-ID') : '-'}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        {debt.status === 'active' && debt.remaining_amount > 0 && (
                            <button
                                onClick={() => setShowPaymentForm(true)}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                            >
                                💳 Bayar
                            </button>
                        )}
                        <button
                            onClick={() => onDelete(debt.id)}
                            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-colors"
                        >
                            🗑️
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Payment Form Modal */}
            {showPaymentForm && (
                <DebtPaymentForm
                    debt={debt}
                    onClose={() => setShowPaymentForm(false)}
                    onPayment={onPayment}
                />
            )}
        </motion.div>
    );
};

export default DebtCard;