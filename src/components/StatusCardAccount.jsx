import React from "react";
import { FaWallet, FaUniversity, FaMoneyBillWave, FaCreditCard, FaChartLine } from "react-icons/fa";

export default function StatusCardAccount({
  account,
  totalIncome = 0,
  totalExpense = 0,
}) {
  if (!account) return null;

  const balance = totalIncome - totalExpense;

  // 🔹 Hitung rasio pengeluaran terhadap pemasukan (jika ada pemasukan)
  const ratio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

  // 🔹 Hitung persentase saldo dari total pemasukan
  const balancePercentage = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  // 🔹 Tentukan status berdasarkan rasio dan kondisi akun
  let status = {
    label: "Belum Ada Data",
    emoji: "⚪",
    color: "text-gray-500",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-200",
    advice: "Tambahkan transaksi untuk akun ini.",
    progressColor: "bg-gray-400"
  };

  if (totalIncome === 0 && totalExpense === 0) {
    status = {
      label: "Belum Ada Aktivitas",
      emoji: "⚪",
      color: "text-gray-500",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      advice: "Akun ini belum memiliki transaksi.",
      progressColor: "bg-gray-300"
    };
  } else if (balance < 0) {
    status = {
      label: "Defisit",
      emoji: "🔴",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      advice: "Pengeluaran melebihi pemasukan. Perlu penyesuaian!",
      progressColor: "bg-red-500"
    };
  } else if (ratio <= 30) {
    status = {
      label: "Sangat Sehat",
      emoji: "🟢",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      advice: "Keuangan akun ini sangat stabil 💪",
      progressColor: "bg-green-500"
    };
  } else if (ratio <= 60) {
    status = {
      label: "Sehat",
      emoji: "🟢",
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      advice: "Kondisi keuangan baik, tetap pertahankan!",
      progressColor: "bg-green-400"
    };
  } else if (ratio <= 80) {
    status = {
      label: "Cukup Baik",
      emoji: "🟡",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      advice: "Masih dalam batas aman, pantau pengeluaran.",
      progressColor: "bg-yellow-500"
    };
  } else if (ratio <= 100) {
    status = {
      label: "Perhatian",
      emoji: "🟠",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      advice: "Pengeluaran mendekati pemasukan, perlu hemat.",
      progressColor: "bg-orange-500"
    };
  } else {
    status = {
      label: "Tidak Sehat",
      emoji: "🔴",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      advice: "Pengeluaran melebihi pemasukan! Evaluasi kebutuhan.",
      progressColor: "bg-red-500"
    };
  }

  // 🔹 Tentukan ikon berdasarkan tipe akun
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

  // 🔹 Tentukan warna background ikon berdasarkan tipe akun
  const getIconBgColor = () => {
    switch (account.type) {
      case "bank":
        return "bg-blue-100 text-blue-600";
      case "cash":
        return "bg-green-100 text-green-600";
      case "ewallet":
        return "bg-purple-100 text-purple-600";
      case "investment":
        return "bg-orange-100 text-orange-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // 🔹 Format angka ke rupiah
  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num || 0);

  // 🔹 Format persentase
  const formatPercentage = (num) => {
    if (isNaN(num) || !isFinite(num)) return "0%";
    return `${Math.abs(num).toFixed(1)}%`;
  };

  const hasTransactions = totalIncome > 0 || totalExpense > 0;

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border ${status.borderColor} transition-all duration-300 group hover:scale-[1.02]`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`p-3 rounded-xl ${getIconBgColor()} transition-colors duration-300 group-hover:scale-110`}>
            {getAccountIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 truncate">{account.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{account.type}</p>
            {account.type === "bank" && account.account_number && (
              <p className="text-xs text-gray-400 truncate">
                No. Rek: {account.account_number}
              </p>
            )}
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bgColor} ${status.color} border ${status.borderColor}`}>
          {status.emoji} {status.label}
        </div>
      </div>

      {/* Balance Summary */}
      <div className="space-y-3 mb-4">
        {/* Saldo Utama */}
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 mb-1">Saldo Akun</p>
          <p className={`text-lg font-bold ${balance >= 0 ? "text-blue-600" : "text-red-600"}`}>
            {formatRupiah(balance)}
          </p>
          {hasTransactions && (
            <p className="text-xs text-gray-400 mt-1">
              {balance >= 0 ? `${formatPercentage(balancePercentage)} dari pemasukan` : "Defisit"}
            </p>
          )}
        </div>

        {/* Income vs Expense */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-green-50 rounded-lg border border-green-100">
            <p className="text-xs text-green-600 font-medium">Pemasukan</p>
            <p className="font-bold text-green-700 text-sm">
              {formatRupiah(totalIncome)}
            </p>
          </div>
          <div className="text-center p-2 bg-red-50 rounded-lg border border-red-100">
            <p className="text-xs text-red-600 font-medium">Pengeluaran</p>
            <p className="font-bold text-red-700 text-sm">
              {formatRupiah(totalExpense)}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar dengan Info Rasio */}
      {hasTransactions && (
        <div className="space-y-2 mb-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600">Rasio Pengeluaran</span>
            <span className="font-semibold text-gray-700">
              {formatPercentage(ratio)}
            </span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-2 transition-all duration-1000 ease-out ${status.progressColor}`}
              style={{
                width: `${Math.min(ratio, 100)}%`,
                transform: 'translateZ(0)' // Optimasi performa animasi
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* Advice & Additional Info */}
      <div className="space-y-2">
        <p className="text-xs text-gray-600 leading-relaxed">{status.advice}</p>

        {/* Additional Metrics */}
        {hasTransactions && (
          <div className="flex justify-between text-xs text-gray-500 border-t border-gray-100 pt-2">
            <span>Transaksi: {Math.round((totalIncome + totalExpense) / 1000)}</span>
            <span>Rata-rata: {formatRupiah((totalIncome + totalExpense) / 10)}</span>
          </div>
        )}
      </div>

      {/* Account Balance (jika ada di data account) */}
      {account.balance !== undefined && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">Saldo Awal</span>
            <span className="font-semibold text-gray-700">
              {formatRupiah(account.balance)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}