import { useState, useEffect } from 'react';
import FinancialOverviewCard from '../FinancialOverviewCard';
import FinancialSummaryFilter from './FinancialSummaryFilter';
import { getFinancialSummary } from '../../services/TransactionService';

export default function FinancialSummarySection({ user, selectedAccount, transactions }) {
  const [summaryData, setSummaryData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    todayIncome: 0,
    todayExpense: 0
  });
  const [period, setPeriod] = useState('overall');
  const [loading, setLoading] = useState(false);

  // Hitung ringkasan harian dari transaksi
  const calculateTodaySummary = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = transactions.filter(t => t.date === today);
    
    const todayIncome = todayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
      
    const todayExpense = todayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return { todayIncome, todayExpense };
  };

  // Ambil data ringkasan sesuai periode
  const fetchSummaryByPeriod = async (period) => {
    if (!user?.id) return;

    setLoading(true);
    
    try {
      const today = new Date();
      let filters = {};

      switch(period) {
        case 'today':
          const todayStr = today.toISOString().split('T')[0];
          filters = { from: todayStr, to: todayStr };
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          filters = { from: weekAgo.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          filters = { from: monthAgo.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
          break;
        case 'overall':
        default:
          // tidak ada filter tanggal
          break;
      }

      const data = await getFinancialSummary(user.id, filters);
      
      // Tambahkan juga data hari ini
      const todaySummary = calculateTodaySummary();
      
      setSummaryData({
        totalIncome: data.totalIncome,
        totalExpense: data.totalExpense,
        balance: data.balance,
        todayIncome: todaySummary.todayIncome,
        todayExpense: todaySummary.todayExpense
      });
    } catch (error) {
      console.error('Error fetching financial summary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryByPeriod(period);
  }, [user, period, transactions]);

  // Handler untuk perubahan periode dari filter
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  return (
    <div className="space-y-6">
      <FinancialSummaryFilter 
        user={user} 
        onSummaryChange={setPeriod} 
        loading={loading} 
        currentPeriod={period}
      />
      
      <FinancialOverviewCard
        totalIncome={summaryData.totalIncome}
        totalExpense={summaryData.totalExpense}
        todayIncome={summaryData.todayIncome}
        todayExpense={summaryData.todayExpense}
        selectedAccount={selectedAccount}
        period={period}
        loading={loading}
      />
    </div>
  );
}