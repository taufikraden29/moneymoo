import React from "react";
import {
  FaWallet,
  FaUniversity,
  FaMoneyBillWave,
  FaCreditCard,
  FaChartLine,
  FaInfoCircle,
  FaArrowUp,
  FaArrowDown,
  FaPiggyBank,
  FaExchangeAlt,
  FaCalendar,
  FaEye,
} from "react-icons/fa";

export default function StatusCardAccount({
  account,
  totalIncome = 0,
  totalExpense = 0,
  onClick,
}) {
  if (!account) return null;

  const balance = totalIncome - totalExpense;
  const ratio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

  // Status configuration
  let status = {
    label: "Belum Ada Aktivitas",
    emoji: "💤",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-200",
    advice: "Akun ini belum memiliki transaksi. Mulai tambahkan transaksi pertama Anda.",
    progressColor: "bg-gray-400",
    gradient: "from-gray-50 to-gray-100",
  };

  if (totalIncome !== 0 || totalExpense !== 0) {
    if (balance < 0) {
      status = {
        label: "Defisit",
        emoji: "📉",
        color: "text-red-600",
        bgColor: "bg-red-100",
        borderColor: "border-red-200",
        advice: "Pengeluaran melebihi pemasukan! Evaluasi pengeluaran dan prioritaskan kebutuhan.",
        progressColor: "bg-red-500",
        gradient: "from-red-50 to-red-100",
      };
    } else if (ratio <= 30) {
      status = {
        label: "Sangat Sehat",
        emoji: "🚀",
        color: "text-green-600",
        bgColor: "bg-green-100",
        borderColor: "border-green-200",
        advice: "Kondisi keuangan sangat optimal! Tabungan tumbuh dengan baik.",
        progressColor: "bg-green-500",
        gradient: "from-green-50 to-green-100",
      };
    } else if (ratio <= 50) {
      status = {
        label: "Sehat",
        emoji: "✅",
        color: "text-green-500",
        bgColor: "bg-green-100",
        borderColor: "border-green-200",
        advice: "Keuangan dalam kondisi baik, tabungan aman dan terkendali.",
        progressColor: "bg-green-400",
        gradient: "from-green-50 to-green-100",
      };
    } else if (ratio <= 70) {
      status = {
        label: "Cukup Baik",
        emoji: "💡",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        borderColor: "border-yellow-200",
        advice: "Masih dalam batas wajar, pertimbangkan untuk meningkatkan tabungan.",
        progressColor: "bg-yellow-500",
        gradient: "from-yellow-50 to-yellow-100",
      };
    } else if (ratio <= 90) {
      status = {
        label: "Perhatian",
        emoji: "⚡",
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        borderColor: "border-orange-200",
        advice: "Pengeluaran mendekati pemasukan, evaluasi pengeluaran tidak penting.",
        progressColor: "bg-orange-500",
        gradient: "from-orange-50 to-orange-100",
      };
    } else {
      status = {
        label: "Kritis",
        emoji: "🚨",
        color: "text-red-600",
        bgColor: "bg-red-100",
        borderColor: "border-red-200",
        advice: "Pengeluaran hampir menyamai pemasukan! Evaluasi pengeluaran Anda.",
        progressColor: "bg-red-500",
        gradient: "from-red-50 to-red-100",
      };
    }
  }

  // Account type icons
  const getAccountIcon = () => {
    switch (account.type) {
      case "bank":
        return <FaUniversity className="w-5 h-5" />;
      case "cash":
        return <FaMoneyBillWave className="w-5 h-5" />;
      case "ewallet":
        return <FaCreditCard className="w-5 h-5" />;
      case "investment":
        return <FaChartLine className="w-5 h-5" />;
      default:
        return <FaWallet className="w-5 h-5" />;
    }
  };

  // Account type colors
  const getAccountTypeStyle = () => {
    switch (account.type) {
      case "bank":
        return { bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-200" };
      case "cash":
        return { bg: "bg-green-100", text: "text-green-600", border: "border-green-200" };
      case "ewallet":
        return { bg: "bg-purple-100", text: "text-purple-600", border: "border-purple-200" };
      case "investment":
        return { bg: "bg-orange-100", text: "text-orange-600", border: "border-orange-200" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" };
    }
  };

  const typeStyle = getAccountTypeStyle();

  // Format currency
  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num || 0);

  // Format percentage
  const formatPercentage = (num) => {
    if (isNaN(num) || !isFinite(num)) return "0%";
    return `${Math.abs(num).toFixed(1)}%`;
  };

  const hasTransactions = totalIncome > 0 || totalExpense > 0;
  const isClickable = !!onClick;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border ${status.borderColor} transition-all duration-300 group overflow-hidden w-full h-full flex flex-col ${
        isClickable ? "hover:shadow-md cursor-pointer" : ""
      } ${onClick ? "hover:scale-[1.01]" : ""}`}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
    >
      {/* Header - Simplified and more responsive */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${typeStyle.bg} ${typeStyle.text}`}>
              {getAccountIcon()}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{account.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-medium ${typeStyle.text} px-2 py-1 rounded-full ${typeStyle.bg} border ${typeStyle.border} capitalize`}>
                  {account.type}
                </span>
                {account.type === "bank" && account.account_number && (
                  <span className="text-xs text-gray-500 truncate max-w-[80px]">
                    ...{account.account_number.slice(-4)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className={`text-lg ${status.color} text-center`}>
            {status.emoji}
          </div>
        </div>
      </div>

      {/* Main Content - Simplified and more readable */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Balance Display - Larger and more prominent */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Saldo</span>
            <span className={`text-sm font-semibold ${balance >= 0 ? "text-blue-600" : "text-red-600"}`}>
              {balance >= 0 ? "✅" : "⚠️"}
            </span>
          </div>
          <div className={`text-2xl font-bold ${balance >= 0 ? "text-blue-700" : "text-red-700"} mb-1 truncate`}>
            {formatRupiah(balance)}
          </div>
        </div>

        {/* Income vs Expense - Clear comparison */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
            <div className="flex items-center gap-2 mb-1">
              <FaArrowUp className="text-green-600 w-4 h-4" />
              <span className="text-xs font-medium text-green-700">Pemasukan</span>
            </div>
            <div className="text-sm font-bold text-green-800 truncate">
              {formatRupiah(totalIncome)}
            </div>
          </div>
          
          <div className="bg-red-50 p-3 rounded-lg border border-red-100">
            <div className="flex items-center gap-2 mb-1">
              <FaArrowDown className="text-red-600 w-4 h-4" />
              <span className="text-xs font-medium text-red-700">Pengeluaran</span>
            </div>
            <div className="text-sm font-bold text-red-800 truncate">
              {formatRupiah(totalExpense)}
            </div>
          </div>
        </div>

        {/* Ratio Display - If there are transactions */}
        {hasTransactions && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">Rasio Pengeluaran</span>
              <span className={`font-semibold ${
                ratio <= 30 ? "text-green-600" : 
                ratio <= 70 ? "text-yellow-600" : "text-red-600"
              }`}>
                {formatPercentage(ratio)}
              </span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  ratio <= 30 ? "bg-green-500" : 
                  ratio <= 70 ? "bg-yellow-500" : "bg-red-500"
                } rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(ratio, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1 flex justify-between">
              <span>Aman</span>
              <span>Bahaya</span>
            </div>
          </div>
        )}

        {/* Status Description - More concise */}
        <div className="mt-auto">
          <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
            <FaInfoCircle className={`w-4 h-4 ${status.color} flex-shrink-0 mt-0.5`} />
            <p className="text-xs text-gray-700">
              {status.advice}
            </p>
          </div>
        </div>
      </div>

      {/* Footer - Creation date and account balance */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <FaCalendar className="w-3 h-3" />
            <span>
              {account.created_at
                ? new Date(account.created_at).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                  })
                : "Tgl. tidak tersedia"}
            </span>
          </div>
          {account.balance !== undefined && (
            <span className="font-medium text-gray-700">
              {formatRupiah(account.balance)}
            </span>
          )}
        </div>
      </div>

      {/* Click indicator */}
      {isClickable && (
        <div className="absolute top-2 right-2 bg-blue-100 text-blue-600 p-1 rounded-full">
          <FaEye className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}
