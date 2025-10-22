import React from "react";

export default function FinancialStatusCard({
  totalIncome,
  totalExpense,
  todayIncome,
  todayExpense,
  selectedAccount,
}) {
  const balance = totalIncome - totalExpense;
  const todayBalance = todayIncome - todayExpense;

  // 🔹 Status analisis keuangan (total)
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

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);

  return (
    <div className="space-y-8">
      {/* ===================== RINGKASAN KESELURUHAN ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
          <div className="text-sm text-gray-500">💰 Total Pemasukan</div>
          <div className="text-4xl font-bold text-green-600 mt-1">
            {formatRupiah(totalIncome)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-red-500">
          <div className="text-sm text-gray-500">💸 Total Pengeluaran</div>
          <div className="text-4xl font-bold text-red-600 mt-1">
            {formatRupiah(totalExpense)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
          <div className="text-sm text-gray-500">🏦 Total Saldo</div>
          <div
            className={`text-4xl font-bold mt-1 ${
              balance >= 0 ? "text-blue-600" : "text-red-600"
            }`}
          >
            {formatRupiah(balance)}
          </div>
        </div>

        {/* 🔹 Status Keuangan */}
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-indigo-500 transition hover:shadow-md">
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
            {selectedAccount?.type === "bank" &&
              selectedAccount.bank_number && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                  Rekening: {selectedAccount.bank_number}
                </span>
              )}
          </div>

          <p className="text-gray-600 text-sm mt-1">{status.advice}</p>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
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

          <div className="mt-3 text-xs text-gray-600 space-y-1">
            <p>
              💰 <strong>Pemasukan:</strong> {formatRupiah(totalIncome)}
            </p>
            <p>
              💸 <strong>Pengeluaran:</strong> {formatRupiah(totalExpense)}
            </p>
            <p>
              📊 <strong>Rasio:</strong> {displayRatio}%
            </p>
          </div>
        </div>
      </div>

      {/* ===================== RINGKASAN HARI INI ===================== */}
      <div>
        <h3 className="text-gray-600 text-sm font-semibold mb-3">
          📅 Ringkasan Hari Ini
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 p-6 rounded-xl shadow border-l-4 border-green-400">
            <div className="text-sm text-gray-600">📥 Pemasukan Hari Ini</div>
            <div className="text-4xl font-bold text-green-600 mt-1">
              {formatRupiah(todayIncome)}
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-xl shadow border-l-4 border-red-400">
            <div className="text-sm text-gray-600">📤 Pengeluaran Hari Ini</div>
            <div className="text-4xl font-bold text-red-600 mt-1">
              {formatRupiah(todayExpense)}
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl shadow border-l-4 border-blue-400">
            <div className="text-sm text-gray-600">💵 Saldo Hari Ini</div>
            <div
              className={`text-4xl font-bold mt-1 ${
                todayBalance >= 0 ? "text-blue-600" : "text-red-600"
              }`}
            >
              {formatRupiah(todayBalance)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
