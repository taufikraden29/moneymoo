import React from "react";
import {
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaPiggyBank,
  FaChartLine,
  FaInfoCircle,
} from "react-icons/fa";

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
      text: "Boros / Tidak Sehat",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      emoji: "⚠️",
      advice: "Kamu mengeluarkan lebih dari pemasukanmu, perlu kontrol lebih!",
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
    } else if (ratio <= 80) {
      status = {
        text: "Cukup Baik",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        emoji: "💡",
        advice: "Stabil, tapi masih bisa disisihkan lebih banyak 💰",
        progressColor: "bg-yellow-500",
      };
    } else if (ratio <= 100) {
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
        text: "Boros / Tidak Sehat",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        emoji: "🚨",
        advice:
          "Kamu mengeluarkan lebih dari pemasukanmu, perlu kontrol lebih!",
        progressColor: "bg-red-500",
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
    <div className="space-y-6">
      {/* ===================== RINGKASAN HARI INI ===================== */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FaChartLine className="text-blue-500" />
            Ringkasan Hari Ini
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pemasukan Hari Ini */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow-sm border border-green-200 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-green-700">
                Pemasukan
              </div>
              <div className="p-2 bg-green-200 rounded-lg">
                <FaArrowUp className="text-green-600 text-sm" />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-800 mb-1">
              {formatRupiah(todayIncome)}
            </div>
            <div className="text-xs text-green-600 flex items-center gap-1">
              <FaMoneyBillWave />
              Transaksi masuk hari ini
            </div>
          </div>

          {/* Pengeluaran Hari Ini */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl shadow-sm border border-red-200 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-red-700">
                Pengeluaran
              </div>
              <div className="p-2 bg-red-200 rounded-lg">
                <FaArrowDown className="text-red-600 text-sm" />
              </div>
            </div>
            <div className="text-3xl font-bold text-red-800 mb-1">
              {formatRupiah(todayExpense)}
            </div>
            <div className="text-xs text-red-600 flex items-center gap-1">
              <FaMoneyBillWave />
              Transaksi keluar hari ini
            </div>
          </div>

          {/* Saldo Hari Ini */}
          <div
            className={`bg-gradient-to-br p-6 rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-md ${
              todayBalance >= 0
                ? "from-blue-50 to-blue-100 border-blue-200"
                : "from-red-50 to-red-100 border-red-200"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
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
              className={`text-3xl font-bold mb-1 ${
                todayBalance >= 0 ? "text-blue-800" : "text-red-800"
              }`}
            >
              {formatRupiah(todayBalance)}
            </div>
            <div
              className={`text-xs flex items-center gap-1 ${
                todayBalance >= 0 ? "text-blue-600" : "text-red-600"
              }`}
            >
              <FaInfoCircle />
              {todayBalance >= 0 ? "Saldo positif" : "Saldo negatif"}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== RINGKASAN KESELURUHAN ===================== */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FaChartLine className="text-purple-500" />
            Ringkasan Keseluruhan
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Pemasukan */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaArrowUp className="text-green-600 text-sm" />
              </div>
              <div className="text-sm font-medium text-gray-600">
                Total Pemasukan
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatRupiah(totalIncome)}
            </div>
          </div>

          {/* Total Pengeluaran */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <FaArrowDown className="text-red-600 text-sm" />
              </div>
              <div className="text-sm font-medium text-gray-600">
                Total Pengeluaran
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatRupiah(totalExpense)}
            </div>
          </div>

          {/* Total Saldo */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaPiggyBank className="text-blue-600 text-sm" />
              </div>
              <div className="text-sm font-medium text-gray-600">
                Total Saldo
              </div>
            </div>
            <div
              className={`text-2xl font-bold ${
                balance >= 0 ? "text-blue-600" : "text-red-600"
              }`}
            >
              {formatRupiah(balance)}
            </div>
          </div>

          {/* 🔹 Status Keuangan */}
          <div
            className={`${status.bgColor} p-5 rounded-2xl shadow-sm border ${status.borderColor} transition-all duration-300 hover:shadow-md`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">
                  {selectedAccount
                    ? `Status Akun: ${selectedAccount.name}`
                    : "Status Keuangan"}
                </div>
                <div
                  className={`text-xl font-bold ${status.color} flex items-center gap-2`}
                >
                  <span>{status.emoji}</span>
                  {status.text}
                </div>
              </div>
              {selectedAccount?.type === "bank" &&
                selectedAccount.bank_number && (
                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-lg border">
                    Rek: {selectedAccount.bank_number}
                  </span>
                )}
            </div>

            <p className="text-gray-700 text-sm mb-4 leading-relaxed">
              {status.advice}
            </p>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Rasio Pengeluaran</span>
                <span>{displayRatio}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${status.progressColor}`}
                  style={{ width: `${Math.min(displayRatio, 120)}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  💰 <strong>Pemasukan:</strong>
                </span>
                <span>{formatRupiah(totalIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  💸 <strong>Pengeluaran:</strong>
                </span>
                <span>{formatRupiah(totalExpense)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
