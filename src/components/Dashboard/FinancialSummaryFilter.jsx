import { useState, useEffect } from 'react';
import { getFinancialSummary } from '../../services/TransactionService';

export default function FinancialSummaryFilter({ user, onSummaryChange, loading }) {
  const [period, setPeriod] = useState('overall'); // 'today', 'week', 'month', 'overall'
  const [summaryData, setSummaryData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  });

  // Fungsi untuk menghitung tanggal berdasarkan periode
  const getDateRange = () => {
    const today = new Date();
    let from = null;
    let to = today.toISOString().split('T')[0]; // Sampai hari ini

    switch(period) {
      case 'today':
        from = to;
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        from = weekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        from = monthAgo.toISOString().split('T')[0];
        break;
      case 'overall':
      default:
        // tidak ada filter tanggal
        break;
    }

    return { from, to };
  };

  // Ambil data ringkasan sesuai periode
  useEffect(() => {
    const fetchSummary = async () => {
      if (!user?.id) return;

      const { from, to } = getDateRange();
      const filters = {
        from: period !== 'overall' ? from : undefined,
        to: period !== 'overall' ? to : undefined
      };

      try {
        const data = await getFinancialSummary(user.id, filters);
        setSummaryData({
          totalIncome: data.totalIncome,
          totalExpense: data.totalExpense,
          balance: data.balance
        });
        // Kirim periode ke parent component
        onSummaryChange(period);
      } catch (error) {
        console.error('Error fetching financial summary:', error);
      }
    };

    fetchSummary();
  }, [user, period, onSummaryChange]);

  const periodLabels = {
    today: 'Harian',
    week: 'Mingguan', 
    month: 'Bulanan',
    overall: 'Keseluruhan'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 mb-6">
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <h3 className="font-semibold text-gray-700">Statistik Keuangan</h3>
        <div className="flex flex-wrap gap-1">
          {Object.entries(periodLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}