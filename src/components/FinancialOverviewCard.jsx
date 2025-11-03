import React from "react";
import { FaMoneyBillWave, FaArrowUp, FaArrowDown, FaPiggyBank, FaChartLine, FaInfoCircle } from "react-icons/fa";

export default function FinancialOverviewCard({ 
  totalIncome, 
  totalExpense, 
  todayIncome, 
  todayExpense,
  selectedAccount,
  period = 'overall', // Tambahkan prop untuk periode
  loading = false 
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl p-4 h-24"></div>
          ))}
        </div>
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl p-4 h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  const balance = totalIncome - totalExpense;
  const todayBalance = todayIncome - todayExpense;

  // Status analisis keuangan (total)
  let status = {
    text: "Belum Ada Data",
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-300",
    emoji: "📊",
    advice: "Tambahkan transaksi untuk melihat analisis keuanganmu.",
    progressColor: "bg-gray-400",
  };

  if (totalIncome === 0 && totalExpense === 0) {
    status = {
      text: "Belum Ada Data",
      color: "text-gray-500",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-300",
      emoji: "📊",
      advice: "Tambahkan transaksi untuk melihat analisis keuanganmu.",
      progressColor: "bg-gray-400",
    };
  } else if (totalIncome === 0 && totalExpense > 0) {
    status = {
      text: "Perlu Perhatian",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      emoji: "⚠️",
      advice: "Kamu hanya memiliki pengeluaran tanpa pemasukan, segera cari sumber penghasilan.",
      progressColor: "bg-red-500",
    };
  } else {
    const ratio = (totalExpense / totalIncome) * 100;
    if (ratio <= 50) {
      status = {
        text: "Keuangan Sehat",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        emoji: "✅",
        advice: "Hebat! Kamu mengatur keuangan dengan sangat baik 💪",
        progressColor: "bg-green-500",
      };
    } else if (ratio <= 70) {
      status = {
        text: "Cukup Baik",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        emoji: "💡",
        advice: "Stabil, tapi masih bisa disisihkan lebih banyak 💰",
        progressColor: "bg-yellow-500",
      };
    } else if (ratio <= 90) {
      status = {
        text: "Waspada",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        emoji: "🔔",
        advice: "Pengeluaranmu hampir sama dengan pemasukan, coba evaluasi 🧾",
        progressColor: "bg-orange-500",
      };
    } else {
      status = {
        text: "Perlu Perhatian",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        emoji: "🚨",
        advice: "Kamu mengeluarkan lebih dari pemasukanmu, perlu kontrol lebih!",
        progressColor: "bg-red-500",
      };
    }
  }

  const displayRatio = totalIncome > 0 ? Math.min(((totalExpense / totalIncome) * 100).toFixed(1), 100) : 0;

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);

  return (
    <div className="space-y-6">
      {/* Ringkasan Hari Ini */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FaChartLine className="text-blue-500" />
            Ringkasan Hari Ini
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pemasukan Hari Ini */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-green-700">
                Pemasukan
              </div>
              <div className="p-2 bg-green-200 rounded-lg">
                <FaArrowUp className="text-green-600 text-sm" />
              </div>
            </div>
            <div className="text-2xl font-bold text-green-800 truncate">
              {formatRupiah(todayIncome)}
            </div>
            <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <FaMoneyBillWave />
              <span className="truncate">Transaksi masuk hari ini</span>
            </div>
          </div>

          {/* Pengeluaran Hari Ini */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-xl border border-red-200 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-red-700">
                Pengeluaran
              </div>
              <div className="p-2 bg-red-200 rounded-lg">
                <FaArrowDown className="text-red-600 text-sm" />
              </div>
            </div>
            <div className="text-2xl font-bold text-red-800 truncate">
              {formatRupiah(todayExpense)}
            </div>
            <div className="text-xs text-red-600 flex items-center gap-1 mt-1">
              <FaMoneyBillWave />
              <span className="truncate">Transaksi keluar hari ini</span>
            </div>
          </div>

          {/* Saldo Hari Ini */}
          <div
            className={`p-5 rounded-xl border transition-all duration-300 hover:shadow-md ${
              todayBalance >= 0
                ? "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
                : "bg-gradient-to-br from-red-50 to-red-100 border-red-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`text-sm font-medium ${
                  todayBalance >= 0 ? "text-blue-700" : "text-red-700"
                }`}
              >
                Saldo Hari Ini
              </div>
              <div
                className={`p-2 rounded-lg ${
                  todayBalance >= 0 ? "bg-blue-200" : "bg-red-200"
                }`}
              >
                <FaPiggyBank
                  className={
                    todayBalance >= 0 ? "text-blue-600" : "text-red-600"
                  }
                />
              </div>
            </div>
            <div
              className={`text-2xl font-bold truncate ${
                todayBalance >= 0 ? "text-blue-800" : "text-red-800"
              }`}
            >
              {formatRupiah(todayBalance)}
            </div>
            <div
              className={`text-xs flex items-center gap-1 mt-1 ${
                todayBalance >= 0 ? "text-blue-600" : "text-red-600"
              }`}
            >
              <FaInfoCircle />
              <span className="truncate">
                {todayBalance >= 0 ? "Saldo positif" : "Saldo negatif"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ringkasan Keseluruhan */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FaChartLine className="text-purple-500" />
            Ringkasan Keseluruhan
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Pemasukan */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaArrowUp className="text-green-600 text-sm" />
              </div>
              <div className="text-sm font-medium text-gray-600 truncate">
                Total Pemasukan
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900 truncate">
              {formatRupiah(totalIncome)}
            </div>
          </div>

          {/* Total Pengeluaran */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <FaArrowDown className="text-red-600 text-sm" />
              </div>
              <div className="text-sm font-medium text-gray-600 truncate">
                Total Pengeluaran
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900 truncate">
              {formatRupiah(totalExpense)}
            </div>
          </div>

          {/* Total Saldo */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaPiggyBank className="text-blue-600 text-sm" />
              </div>
              <div className="text-sm font-medium text-gray-600 truncate">
                Total Saldo
              </div>
            </div>
            <div
              className={`text-xl font-bold truncate ${
                balance >= 0 ? "text-blue-600" : "text-red-600"
              }`}
            >
              {formatRupiah(balance)}
            </div>
          </div>

          {/* Status Keuangan */}
          <div
            className={`${status.bgColor} p-4 rounded-xl border ${status.borderColor} transition-all duration-300 hover:shadow-md`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-sm text-gray-600 mb-1">
                  {selectedAccount
                    ? `Status Akun: ${selectedAccount.name}`
                    : "Status Keuangan"}
                </div>
                <div
                  className={`text-lg font-bold ${status.color} flex items-center gap-2`}
                >
                  <span>{status.emoji}</span>
                  <span className="truncate">{status.text}</span>
                </div>
              </div>
              {selectedAccount?.type === "bank" &&
                selectedAccount.account_number && (
                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-lg border truncate max-w-[80px] text-center">
                    {selectedAccount.account_number.slice(-4)}
                  </span>
                )}
            </div>

            <p className="text-gray-700 text-xs mb-3 leading-relaxed line-clamp-2">
              {status.advice}
            </p>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Rasio</span>
                <span>{displayRatio}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${status.progressColor}`}
                  style={{ width: `${displayRatio}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}