import React from "react";
import { FaWallet, FaUniversity, FaMoneyBillWave } from "react-icons/fa";

export default function StatusCardAccount({
  account,
  totalIncome = 0,
  totalExpense = 0,
}) {
  if (!account) return null;

  const balance = totalIncome - totalExpense;

  // 🔹 Hitung rasio pengeluaran terhadap pemasukan
  const ratio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

  // 🔹 Tentukan status berdasarkan rasio
  let status = {
    label: "Belum Ada Data",
    emoji: "⚪",
    color: "text-gray-500",
    advice: "Tambahkan transaksi untuk akun ini.",
  };

  if (totalIncome === 0 && totalExpense === 0) {
    status = {
      label: "Belum Ada Aktivitas",
      emoji: "⚪",
      color: "text-gray-500",
      advice: "Akun ini belum memiliki transaksi.",
    };
  } else if (ratio <= 50) {
    status = {
      label: "Sehat",
      emoji: "🟢",
      color: "text-green-600",
      advice: "Keuangan akun ini stabil 💪",
    };
  } else if (ratio <= 80) {
    status = {
      label: "Cukup Baik",
      emoji: "🟡",
      color: "text-yellow-600",
      advice: "Masih dalam batas aman, tetap pantau pengeluaran.",
    };
  } else if (ratio <= 100) {
    status = {
      label: "Waspada",
      emoji: "🟠",
      color: "text-orange-600",
      advice: "Pengeluaran mendekati batas pemasukan.",
    };
  } else {
    status = {
      label: "Boros / Tidak Sehat",
      emoji: "🔴",
      color: "text-red-600",
      advice: "Akun ini mengalami defisit, periksa kembali transaksi.",
    };
  }

  // 🔹 Tentukan ikon berdasarkan tipe akun
  const Icon =
    account.type === "bank"
      ? FaUniversity
      : account.type === "cash"
      ? FaMoneyBillWave
      : FaWallet;

  // 🔹 Format angka ke rupiah
  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg border border-gray-100 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{account.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{account.type}</p>
            {account.type === "bank" && account.bank_number && (
              <p className="text-xs text-gray-400">
                No. Rek: {account.bank_number}
              </p>
            )}
          </div>
        </div>
        <span className={`text-sm font-semibold ${status.color}`}>
          {status.emoji} {status.label}
        </span>
      </div>

      {/* Balance Info */}
      <div className="grid grid-cols-3 gap-4 text-center mb-4">
        <div>
          <p className="text-xs text-gray-500">Pemasukan</p>
          <p className="font-bold text-green-600 text-sm">
            {formatRupiah(totalIncome)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Pengeluaran</p>
          <p className="font-bold text-red-500 text-sm">
            {formatRupiah(totalExpense)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Saldo</p>
          <p
            className={`font-bold text-sm ${
              balance >= 0 ? "text-blue-600" : "text-red-600"
            }`}
          >
            {formatRupiah(balance)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-3">
        <div
          className={`h-2 transition-all duration-500 ${
            ratio <= 50
              ? "bg-green-500"
              : ratio <= 80
              ? "bg-yellow-500"
              : ratio <= 100
              ? "bg-orange-500"
              : "bg-red-500"
          }`}
          style={{ width: `${Math.min(ratio, 120)}%` }}
        ></div>
      </div>

      {/* Advice */}
      <p className="text-xs text-gray-600 italic">{status.advice}</p>
    </div>
  );
}
