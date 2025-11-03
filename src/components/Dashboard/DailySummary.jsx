// src/components/Dashboard/DailySummary.jsx
import { formatRupiah } from "../../utils/currency";

export default function DailySummary({ todayIncome, todayExpense, loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  const todayBalance = todayIncome - todayExpense;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-700 text-sm mb-2">Ringkasan Hari Ini</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-green-600">Pemasukan:</span>
          <span className="text-sm font-medium text-green-600">
            {formatRupiah(todayIncome)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-red-600">Pengeluaran:</span>
          <span className="text-sm font-medium text-red-600">
            {formatRupiah(todayExpense)}
          </span>
        </div>
        <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold">
          <span className="text-sm text-gray-700">Saldo:</span>
          <span className={`text-sm ${todayBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatRupiah(todayBalance)}
          </span>
        </div>
      </div>
    </div>
  );
}