import React from "react";

export default function FinancialStatusCard({ totalIncome, totalExpense }) {
  let status = {
    text: "Belum Ada Data",
    color: "text-gray-500",
    emoji: "⚪",
    advice: "",
  };

  const balance = totalIncome - totalExpense;

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
        ratio,
      };
    } else if (ratio <= 80) {
      status = {
        text: "Cukup Baik",
        color: "text-yellow-600",
        emoji: "🟡",
        advice: "Lumayan stabil, tapi masih bisa disisihkan lebih banyak.",
        ratio,
      };
    } else if (ratio <= 100) {
      status = {
        text: "Waspada",
        color: "text-orange-600",
        emoji: "🟠",
        advice: "Pengeluaranmu hampir sama dengan pemasukan, coba evaluasi.",
        ratio,
      };
    } else {
      status = {
        text: "Boros / Tidak Sehat",
        color: "text-red-600",
        emoji: "🔴",
        advice:
          "Kamu mengeluarkan lebih dari pemasukanmu 😥, perlu kontrol lebih!",
        ratio,
      };
    }
  }

  const displayRatio =
    totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) : 100;

  const formatRupiah = (number) => {
    if (!number) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border-l-4 border-indigo-500 transition hover:shadow-md">
      <div className="text-sm text-gray-500">Status Keuangan</div>
      <div className={`text-2xl font-bold mt-1 ${status.color}`}>
        {status.emoji} {status.text}
      </div>
      <p className="text-gray-600 text-sm mt-2">{status.advice}</p>

      {/* Informasi perhitungan */}
      {/* <div className="mt-4 text-gray-700 text-sm space-y-1">
        <p>Total Pemasukan: {formatRupiah(totalIncome)}</p>
        <p>Total Pengeluaran: {formatRupiah(totalExpense)}</p>
        <p>Saldo: {formatRupiah(balance)}</p>
        <p>Rasio Pengeluaran: {displayRatio}%</p>
      </div> */}

      {/* Progress bar visual */}
      <div className="w-full bg-gray-200 h-2 rounded-full mt-3 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all ${
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

      {/* Legend */}
      <div className="mt-4 text-sm text-gray-600">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-4 h-4 bg-green-500 rounded-full inline-block"></span>
          <span>Keuangan Sehat (Rasio ≤ 50%)</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-4 h-4 bg-yellow-500 rounded-full inline-block"></span>
          <span>Cukup Baik (Rasio 51%-80%)</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-4 h-4 bg-orange-500 rounded-full inline-block"></span>
          <span>Waspada (Rasio 81%-100%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-red-500 rounded-full inline-block"></span>
          <span>Boros / Tidak Sehat (Rasio = 100%)</span>
        </div>
      </div>
    </div>
  );
}
