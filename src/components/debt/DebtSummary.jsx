import React from 'react';
import { motion } from 'framer-motion';

const DebtSummary = ({ stats }) => {
    if (!stats) return null;

    const cards = [
        {
            title: 'Total Hutang',
            amount: stats.totalDebt,
            remaining: stats.remainingDebt,
            color: 'red',
            icon: '🔴'
        },
        {
            title: 'Total Piutang',
            amount: stats.totalReceivable,
            remaining: stats.remainingReceivable,
            color: 'green',
            icon: '🟢'
        },
        {
            title: 'Hutang Aktif',
            count: stats.activeDebts,
            color: 'blue',
            icon: '📋'
        },
        {
            title: 'Piutang Aktif',
            count: stats.activeReceivables,
            color: 'purple',
            icon: '📄'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((card, index) => (
                <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${card.color === 'red' ? 'border-l-4 border-l-red-500' :
                            card.color === 'green' ? 'border-l-4 border-l-green-500' :
                                card.color === 'blue' ? 'border-l-4 border-l-blue-500' :
                                    'border-l-4 border-l-purple-500'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">{card.title}</p>
                            {card.amount !== undefined ? (
                                <>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">
                                        Rp {card.amount.toLocaleString('id-ID')}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Sisa: Rp {card.remaining.toLocaleString('id-ID')}
                                    </p>
                                </>
                            ) : (
                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {card.count}
                                </p>
                            )}
                        </div>
                        <span className="text-3xl">{card.icon}</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default DebtSummary;