import React from "react";

export default function FinancialStatusCard({
  totalIncome,
  totalExpense,
  selectedAccount,
}) {
  const balance = totalIncome - totalExpense;

  let status = {
    text: "Belum Ada Data",
    color: "text-gray-500",
    emoji: "⚪",
    advice: "Tambahkan transaksi untuk melihat analisis keuanganmu.",
  };

  if (totalIncome === 0 && totalExpense === 0) {
    status = {
      text: "Belum Ada Data",
      color: "text-gray-500",
      emoji: "⚪",
      advice: "Tambahkan transaksi untuk melihat analisis keuanganmu.",
    };
  } else if (totalIncome === 0 && totalExpense > 0) {
    status = {
      text: "Boros / Tidak Sehat",
      color: "text-red-600",
      emoji: "🔴",
      advice:
        "Kamu mengeluarkan lebih dari pemasukanmu 😥, perlu kontrol lebih!",
    };
  } else {
    const ratio = (totalExpense / totalIncome) * 100;
    if (ratio <= 50) {
      status = {
        text: "Keuangan Sehat",
        color: "text-green-600",
        emoji: "🟢",
        advice: "Hebat! Kamu mengatur keuangan dengan sangat baik 💪",
      };
    } else if (ratio <= 80) {
      status = {
        text: "Cukup Baik",
        color: "text-yellow-600",
        emoji: "🟡",
        advice: "Stabil, tapi masih bisa disisihkan lebih banyak 💰",
      };
    } else if (ratio <= 100) {
      status = {
        text: "Waspada",
        color: "text-orange-600",
        emoji: "🟠",
        advice: "Pengeluaranmu hampir sama dengan pemasukan, coba evaluasi 🧾",
      };
    } else {
      status = {
        text: "Boros / Tidak Sehat",
        color: "text-red-600",
        emoji: "🔴",
        advice:
          "Kamu mengeluarkan lebih dari pemasukanmu 😥, perlu kontrol lebih!",
      };
    }
  }

  const displayRatio =
    totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) : 100;

  const formatRupiah = (number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number || 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow border-l-4 border-indigo-500 transition hover:shadow-md">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-sm text-gray-500">
            {selectedAccount
              ? `Status Akun: ${selectedAccount.name}`
              : "Status Keuangan"}
          </div>
          <div className={`text-2xl font-bold mt-1 ${status.color}`}>
            {status.emoji} {status.text}
          </div>
        </div>
        {selectedAccount?.type === "bank" && selectedAccount.bank_number && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
            Rekening: {selectedAccount.bank_number}
          </span>
        )}
      </div>

      {/* Advice */}
      <p className="text-gray-600 text-sm mt-1">{status.advice}</p>

      {/* Visual progress */}
      <div className="w-full bg-gray-200 h-2 rounded-full mt-3 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ease-in-out ${
            status.color === "text-green-600"
              ? "bg-green-500"
              : status.color === "text-yellow-600"
              ? "bg-yellow-500"
              : status.color === "text-orange-600"
              ? "bg-orange-500"
              : "bg-red-500"
          }`}
          style={{ width: `${Math.min(displayRatio, 120)}%` }}
        ></div>
      </div>

      {/* Summary */}
      <div className="mt-4 text-gray-700 text-sm space-y-1">
        <p>
          💰 <strong>Pemasukan:</strong> {formatRupiah(totalIncome)}
        </p>
        <p>
          💸 <strong>Pengeluaran:</strong> {formatRupiah(totalExpense)}
        </p>
        <p>
          🧮 <strong>Saldo:</strong>{" "}
          <span
            className={`font-semibold ${
              balance >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatRupiah(balance)}
          </span>
        </p>
        <p>
          📊 <strong>Rasio Pengeluaran:</strong> {displayRatio}%
        </p>
      </div>

      {/* Legend */}
      <div className="mt-4 text-xs text-gray-600 border-t pt-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
          <span>Sehat (≤ 50%)</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 bg-yellow-500 rounded-full inline-block"></span>
          <span>Cukup Baik (51%-80%)</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 bg-orange-500 rounded-full inline-block"></span>
          <span>Waspada (81%-100%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span>
          <span>Tidak Sehat (- 100%)</span>
        </div>
      </div>
    </div>
  );
}
