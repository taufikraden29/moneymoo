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

  // 🔹 Status configuration dengan gradient yang lebih smooth
  let status = {
    label: "Belum Ada Data",
    emoji: "📊",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-200",
    advice: "Tambahkan transaksi untuk melihat analisis keuangan akun ini.",
    progressColor: "from-gray-400 to-gray-500",
    health: "no-data",
    gradient: "from-gray-50 to-gray-100",
  };

  if (totalIncome === 0 && totalExpense === 0) {
    status = {
      label: "Belum Ada Aktivitas",
      emoji: "💤",
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      borderColor: "border-gray-200",
      advice:
        "Akun ini belum memiliki transaksi. Mulai tambahkan transaksi pertama Anda.",
      progressColor: "from-gray-300 to-gray-400",
      health: "inactive",
      gradient: "from-gray-50 to-gray-100",
    };
  } else if (balance < 0) {
    status = {
      label: "Defisit",
      emoji: "📉",
      color: "text-red-600",
      bgColor: "bg-red-100",
      borderColor: "border-red-200",
      advice:
        "Pengeluaran melebihi pemasukan! Evaluasi pengeluaran dan prioritaskan kebutuhan.",
      progressColor: "from-red-500 to-red-600",
      health: "deficit",
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
      progressColor: "from-green-500 to-green-600",
      health: "excellent",
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
      progressColor: "from-green-400 to-green-500",
      health: "good",
      gradient: "from-green-50 to-green-100",
    };
  } else if (ratio <= 70) {
    status = {
      label: "Cukup Baik",
      emoji: "💡",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      borderColor: "border-yellow-200",
      advice:
        "Masih dalam batas wajar, pertimbangkan untuk meningkatkan tabungan.",
      progressColor: "from-yellow-500 to-yellow-600",
      health: "fair",
      gradient: "from-yellow-50 to-yellow-100",
    };
  } else if (ratio <= 90) {
    status = {
      label: "Perhatian",
      emoji: "⚡",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      borderColor: "border-orange-200",
      advice:
        "Pengeluaran mendekati pemasukan, evaluasi pengeluaran tidak penting.",
      progressColor: "from-orange-500 to-orange-600",
      health: "warning",
      gradient: "from-orange-50 to-orange-100",
    };
  } else if (ratio <= 100) {
    status = {
      label: "Kritis",
      emoji: "🚨",
      color: "text-red-600",
      bgColor: "bg-red-100",
      borderColor: "border-red-200",
      advice:
        "Hampir tidak ada tabungan! Prioritas evaluasi pengeluaran mendesak.",
      progressColor: "from-red-500 to-red-600",
      health: "critical",
      gradient: "from-red-50 to-red-100",
    };
  } else {
    status = {
      label: "Defisit Parah",
      emoji: "💸",
      color: "text-red-700",
      bgColor: "bg-red-100",
      borderColor: "border-red-300",
      advice:
        "Pengeluaran jauh melebihi pemasukan! Butuh penyesuaian strategi keuangan.",
      progressColor: "from-red-600 to-red-700",
      health: "severe",
      gradient: "from-red-50 to-red-100",
    };
  }

  // 🔹 Tentukan ikon berdasarkan tipe akun
  const getAccountIcon = () => {
    switch (account.type) {
      case "bank":
        return <FaUniversity className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "cash":
        return <FaMoneyBillWave className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "ewallet":
        return <FaCreditCard className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "investment":
        return <FaChartLine className="w-4 h-4 sm:w-5 sm:h-5" />;
      default:
        return <FaWallet className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  // 🔹 Tentukan warna berdasarkan tipe akun
  const getAccountTypeStyle = () => {
    switch (account.type) {
      case "bank":
        return {
          bg: "bg-blue-100",
          text: "text-blue-600",
          border: "border-blue-200",
          gradient: "from-blue-500 to-blue-600",
        };
      case "cash":
        return {
          bg: "bg-green-100",
          text: "text-green-600",
          border: "border-green-200",
          gradient: "from-green-500 to-green-600",
        };
      case "ewallet":
        return {
          bg: "bg-purple-100",
          text: "text-purple-600",
          border: "border-purple-200",
          gradient: "from-purple-500 to-purple-600",
        };
      case "investment":
        return {
          bg: "bg-orange-100",
          text: "text-orange-600",
          border: "border-orange-200",
          gradient: "from-orange-500 to-orange-600",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-600",
          border: "border-gray-200",
          gradient: "from-gray-500 to-gray-600",
        };
    }
  };

  const typeStyle = getAccountTypeStyle();

  // 🔹 Format angka ke rupiah
  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num || 0);

  // 🔹 Format persentase
  const formatPercentage = (num) => {
    if (isNaN(num) || !isFinite(num)) return "0%";
    return `${Math.abs(num).toFixed(1)}%`;
  };

  const hasTransactions = totalIncome > 0 || totalExpense > 0;
  const isClickable = !!onClick;

  return (
    <div
      className={`relative bg-gradient-to-br ${
        status.gradient
      } p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-lg border ${
        status.borderColor
      } transition-all duration-300 group ${
        isClickable
          ? "hover:scale-[1.02] cursor-pointer hover:border-blue-300 active:scale-95"
          : "hover:scale-[1.01]"
      } overflow-hidden w-full h-full min-h-[320px] flex flex-col`}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
    >
      {/* Background decorative element */}
      <div
        className={`absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 ${typeStyle.bg} opacity-10 rounded-full -translate-y-8 translate-x-8 sm:-translate-y-16 sm:translate-x-16`}
      ></div>

      {/* Header - Responsive dengan flex-wrap */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 sm:mb-6 relative z-10">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${typeStyle.bg} ${typeStyle.text} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg flex-shrink-0`}
          >
            {getAccountIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 truncate text-lg sm:text-xl mb-1">
              {account.name}
            </h3>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <span
                className={`text-xs font-semibold ${typeStyle.text} px-2 py-1 sm:px-3 sm:py-1 ${typeStyle.bg} rounded-full border ${typeStyle.border} capitalize flex-shrink-0`}
              >
                {account.type}
              </span>
              {account.type === "bank" && account.account_number && (
                <span className="text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full border flex-shrink-0 truncate max-w-[120px] sm:max-w-none">
                  {account.account_number}
                </span>
              )}
            </div>
          </div>
        </div>
        <div
          className={`px-3 py-1 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl ${status.bgColor} ${status.color} border ${status.borderColor} flex items-center gap-2 text-xs sm:text-sm font-semibold backdrop-blur-sm w-fit flex-shrink-0`}
        >
          <span className="text-sm sm:text-lg">{status.emoji}</span>
          <span className="hidden xs:inline">{status.label}</span>
        </div>
      </div>

      {/* Balance Overview - Responsive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 relative z-10 flex-1">
        {/* Main Balance */}
        <div
          className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-sm border ${
            balance >= 0
              ? "bg-gradient-to-br from-blue-50 to-blue-100/80 border-blue-200"
              : "bg-gradient-to-br from-red-50 to-red-100/80 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div
              className={`p-1 sm:p-2 rounded-lg sm:rounded-xl ${
                balance >= 0
                  ? "bg-blue-200 text-blue-600"
                  : "bg-red-200 text-red-600"
              }`}
            >
              <FaPiggyBank className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-gray-700 truncate">
                Saldo Aktif
              </p>
              <p
                className={`text-lg sm:text-xl lg:text-2xl font-bold truncate ${
                  balance >= 0 ? "text-blue-800" : "text-red-800"
                }`}
              >
                {formatRupiah(balance)}
              </p>
            </div>
          </div>
          {hasTransactions && (
            <div
              className={`text-xs px-2 py-1 rounded-full ${
                balance >= 0
                  ? "bg-blue-200 text-blue-700"
                  : "bg-red-200 text-red-700"
              }`}
            >
              {balance >= 0 ? "✅ Saldo Positif" : "⚠️ Perlu Perhatian"}
            </div>
          )}
        </div>

        {/* Income vs Expense */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-green-50 to-green-100/80 rounded-lg sm:rounded-xl border border-green-200">
            <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
              <div className="p-1 sm:p-2 bg-green-200 rounded-lg flex-shrink-0">
                <FaArrowUp className="text-green-600 w-2 h-2 sm:w-3 sm:h-3" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-green-800 truncate">
                Pemasukan
              </span>
            </div>
            <span className="font-bold text-green-900 text-sm sm:text-base ml-2 flex-shrink-0">
              {formatRupiah(totalIncome)}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-red-50 to-red-100/80 rounded-lg sm:rounded-xl border border-red-200">
            <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
              <div className="p-1 sm:p-2 bg-red-200 rounded-lg flex-shrink-0">
                <FaArrowDown className="text-red-600 w-2 h-2 sm:w-3 sm:h-3" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-red-800 truncate">
                Pengeluaran
              </span>
            </div>
            <span className="font-bold text-red-900 text-sm sm:text-base ml-2 flex-shrink-0">
              {formatRupiah(totalExpense)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar dengan Info Rasio */}
      {hasTransactions && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200 relative z-10">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-1 sm:gap-2">
              <FaExchangeAlt className="text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-semibold text-gray-700">
                Rasio Pengeluaran
              </span>
            </div>
            <span
              className={`text-base sm:text-lg font-bold ${
                ratio <= 40
                  ? "text-green-600"
                  : ratio <= 70
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {formatPercentage(ratio)}
            </span>
          </div>

          <div className="w-full bg-gray-200 h-2 sm:h-3 rounded-full overflow-hidden mb-1 sm:mb-2">
            <div
              className={`h-2 sm:h-3 bg-gradient-to-r ${status.progressColor} transition-all duration-1000 ease-out rounded-full`}
              style={{
                width: `${Math.min(ratio, 100)}%`,
              }}
            ></div>
          </div>

          <div className="flex justify-between text-xs text-gray-500 px-1">
            <span className={ratio <= 33 ? "text-green-600 font-bold" : ""}>
              Aman
            </span>
            <span
              className={
                ratio > 33 && ratio <= 66 ? "text-yellow-600 font-bold" : ""
              }
            >
              Waspada
            </span>
            <span className={ratio > 66 ? "text-red-600 font-bold" : ""}>
              Bahaya
            </span>
          </div>
        </div>
      )}

      {/* Advice Section */}
      <div className="mb-4 sm:mb-6 relative z-10 flex-shrink-0">
        <div className="p-2 sm:p-3 bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200">
          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
            <FaInfoCircle className="text-blue-500 w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-semibold text-gray-700">
              Analisis Keuangan
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed line-clamp-2 sm:line-clamp-3">
            {status.advice}
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 relative z-10 mt-auto flex-shrink-0">
        <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
          <FaCalendar className="text-gray-400 w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">
            {account.created_at
              ? new Date(account.created_at).toLocaleDateString("id-ID")
              : "Tanggal tidak tersedia"}
          </span>
        </div>

        {account.balance !== undefined && (
          <div className="text-right ml-2 flex-shrink-0">
            <div className="text-xs text-gray-500">Saldo Awal</div>
            <div className="font-semibold text-gray-800 text-sm">
              {formatRupiah(account.balance)}
            </div>
          </div>
        )}
      </div>

      {/* Click indicator */}
      {isClickable && (
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20">
          <div className="flex items-center gap-1 text-blue-600 bg-blue-100/90 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-2 rounded-full border border-blue-200 text-xs sm:text-sm font-semibold transition-all duration-300 group-hover:bg-blue-200">
            <FaEye className="w-2 h-2 sm:w-3 sm:h-3" />
            <span className="hidden xs:inline">Lihat Detail</span>
          </div>
        </div>
      )}

      {/* Hover effect overlay */}
      {isClickable && (
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 transition-all duration-500 pointer-events-none"></div>
      )}
    </div>
  );
}
