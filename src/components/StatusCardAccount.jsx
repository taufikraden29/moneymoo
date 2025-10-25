import React from "react";
import { FaWallet, FaUniversity, FaMoneyBillWave, FaCreditCard, FaChartLine, FaInfoCircle } from "react-icons/fa";

export default function StatusCardAccount({
  account,
  totalIncome = 0,
  totalExpense = 0,
  onClick, // 🔥 NEW: Optional click handler
}) {
  if (!account) return null;

  const balance = totalIncome - totalExpense;

  // 🔹 Hitung rasio pengeluaran terhadap pemasukan (jika ada pemasukan)
  const ratio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

  // 🔹 Hitung persentase saldo dari total pemasukan
  const balancePercentage = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  // 🔹 Hitung jumlah transaksi (estimasi berdasarkan total amount)
  const transactionCount = Math.max(
    1,
    Math.round((totalIncome + totalExpense) / Math.max(totalIncome, totalExpense, 100000))
  );

  // 🔹 Hitung rata-rata transaksi
  const averageTransaction = transactionCount > 0 ? (totalIncome + totalExpense) / transactionCount : 0;

  // 🔹 Tentukan status berdasarkan rasio dan kondisi akun
  let status = {
    label: "Belum Ada Data",
    emoji: "⚪",
    color: "text-gray-500",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-200",
    advice: "Tambahkan transaksi untuk akun ini.",
    progressColor: "bg-gray-400",
    health: "no-data"
  };

  if (totalIncome === 0 && totalExpense === 0) {
    status = {
      label: "Belum Ada Aktivitas",
      emoji: "⚪",
      color: "text-gray-500",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      advice: "Akun ini belum memiliki transaksi.",
      progressColor: "bg-gray-300",
      health: "inactive"
    };
  } else if (balance < 0) {
    status = {
      label: "Defisit",
      emoji: "🔴",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      advice: "Pengeluaran melebihi pemasukan! Perlu evaluasi segera.",
      progressColor: "bg-red-500",
      health: "deficit"
    };
  } else if (ratio <= 20) {
    status = {
      label: "Sangat Sehat",
      emoji: "🟢",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      advice: "Kondisi keuangan sangat baik! Tabungan tumbuh optimal 💪",
      progressColor: "bg-green-500",
      health: "excellent"
    };
  } else if (ratio <= 40) {
    status = {
      label: "Sehat",
      emoji: "🟢",
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      advice: "Keuangan dalam kondisi baik, tabungan aman ✅",
      progressColor: "bg-green-400",
      health: "good"
    };
  } else if (ratio <= 60) {
    status = {
      label: "Cukup Baik",
      emoji: "🟡",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      advice: "Masih dalam batas wajar, tetap pantau pengeluaran.",
      progressColor: "bg-yellow-500",
      health: "fair"
    };
  } else if (ratio <= 80) {
    status = {
      label: "Perhatian",
      emoji: "🟠",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      advice: "Pengeluaran mendekati pemasukan, perlu penghematan.",
      progressColor: "bg-orange-500",
      health: "warning"
    };
  } else if (ratio <= 100) {
    status = {
      label: "Kritis",
      emoji: "🔴",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      advice: "Hampir tidak ada tabungan! Evaluasi pengeluaran mendesak.",
      progressColor: "bg-red-500",
      health: "critical"
    };
  } else {
    status = {
      label: "Defisit Parah",
      emoji: "💀",
      color: "text-red-700",
      bgColor: "bg-red-100",
      borderColor: "border-red-300",
      advice: "Pengeluaran jauh melebihi pemasukan! Butuh penyesuaian drastis.",
      progressColor: "bg-red-600",
      health: "severe"
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
        return "bg-blue-100 text-blue-600 group-hover:bg-blue-200";
      case "cash":
        return "bg-green-100 text-green-600 group-hover:bg-green-200";
      case "ewallet":
        return "bg-purple-100 text-purple-600 group-hover:bg-purple-200";
      case "investment":
        return "bg-orange-100 text-orange-600 group-hover:bg-orange-200";
      default:
        return "bg-gray-100 text-gray-600 group-hover:bg-gray-200";
    }
  };

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

  // 🔹 Format angka sederhana (untuk jumlah transaksi)
  const formatNumber = (num) => {
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const hasTransactions = totalIncome > 0 || totalExpense > 0;
  const isClickable = !!onClick;

  return (
    <div
      className={`bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border ${status.borderColor} transition-all duration-300 group ${isClickable
        ? 'hover:scale-[1.02] cursor-pointer hover:border-blue-300'
        : 'hover:scale-[1.01]'
        }`}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`p-3 rounded-xl ${getIconBgColor()} transition-all duration-300 group-hover:scale-110`}>
            {getAccountIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 truncate text-lg">{account.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500 capitalize px-2 py-1 bg-gray-100 rounded-full">
                {account.type}
              </span>
              {account.type === "bank" && account.account_number && (
                <span className="text-xs text-gray-400 bg-white border px-2 py-1 rounded-full">
                  {account.account_number}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bgColor} ${status.color} border ${status.borderColor} flex items-center gap-1`}>
          {status.emoji} <span>{status.label}</span>
        </div>
      </div>

      {/* Balance Summary */}
      <div className="space-y-3 mb-4">
        {/* Saldo Utama */}
        <div className={`text-center p-4 rounded-xl border ${balance >= 0
          ? "bg-blue-50 border-blue-200"
          : "bg-red-50 border-red-200"
          }`}>
          <p className="text-xs text-gray-600 mb-1 font-medium">SALDO AKTIF</p>
          <p className={`text-xl font-bold ${balance >= 0 ? "text-blue-600" : "text-red-600"}`}>
            {formatRupiah(balance)}
          </p>
          {hasTransactions && (
            <p className="text-xs text-gray-500 mt-2">
              {balance >= 0
                ? `📈 ${formatPercentage(balancePercentage)} dari pemasukan`
                : "📉 Defisit - Perlu penyesuaian"
              }
            </p>
          )}
        </div>

        {/* Income vs Expense */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
            <p className="text-xs text-green-700 font-medium mb-1">PEMASUKAN</p>
            <p className="font-bold text-green-800 text-lg">
              {formatRupiah(totalIncome)}
            </p>
            <div className="w-full bg-green-200 h-1 rounded-full mt-2">
              <div
                className="bg-green-500 h-1 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(ratio, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
            <p className="text-xs text-red-700 font-medium mb-1">PENGELUARAN</p>
            <p className="font-bold text-red-800 text-lg">
              {formatRupiah(totalExpense)}
            </p>
            <div className="w-full bg-red-200 h-1 rounded-full mt-2">
              <div
                className="bg-red-500 h-1 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(ratio, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar dengan Info Rasio */}
      {hasTransactions && (
        <div className="space-y-3 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-700 font-medium flex items-center gap-1">
              <FaInfoCircle className="text-gray-400" />
              Rasio Pengeluaran
            </span>
            <span className={`text-sm font-bold ${ratio <= 40 ? "text-green-600" :
              ratio <= 70 ? "text-yellow-600" :
                "text-red-600"
              }`}>
              {formatPercentage(ratio)}
            </span>
          </div>
          <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
            <div
              className={`h-3 transition-all duration-1000 ease-out ${status.progressColor}`}
              style={{
                width: `${Math.min(ratio, 100)}%`,
                transform: 'translateZ(0)'
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 px-1">
            <span className={ratio <= 33 ? "text-green-600 font-semibold" : ""}>Aman</span>
            <span className={ratio > 33 && ratio <= 66 ? "text-yellow-600 font-semibold" : ""}>Waspada</span>
            <span className={ratio > 66 ? "text-red-600 font-semibold" : ""}>Bahaya</span>
          </div>
        </div>
      )}

      {/* Advice & Additional Info */}
      <div className="space-y-3">
        <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-700 leading-relaxed text-center">
            {status.advice}
          </p>
        </div>

        {/* Additional Metrics */}
        {hasTransactions && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center p-2 bg-white border border-gray-200 rounded-lg">
              <p className="text-gray-600 font-medium">Transaksi</p>
              <p className="text-gray-800 font-bold">{formatNumber(transactionCount)}</p>
            </div>
            <div className="text-center p-2 bg-white border border-gray-200 rounded-lg">
              <p className="text-gray-600 font-medium">Rata-rata</p>
              <p className="text-gray-800 font-bold">{formatRupiah(averageTransaction)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Account Balance & Info */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-600">
          <span>Saldo Awal:</span>
          <span className="font-semibold text-gray-700">
            {formatRupiah(account.balance || 0)}
          </span>
        </div>
        {account.created_at && (
          <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
            <span>Dibuat:</span>
            <span>{new Date(account.created_at).toLocaleDateString('id-ID')}</span>
          </div>
        )}
      </div>

      {/* Click indicator */}
      {isClickable && (
        <div className="mt-3 text-center">
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
            Klik untuk detail →
          </span>
        </div>
      )}
    </div>
  );
}