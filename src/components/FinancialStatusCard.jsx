import React from "react";

export default function FinancialStatusCard({ totalIncome, totalExpense }) {
    if (totalIncome === 0 && totalExpense === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow border-l-4 border-gray-300">
                <div className="text-sm text-gray-500">Status Keuangan</div>
                <div className="text-2xl font-bold text-gray-500 mt-1">⚪ Belum Ada Data</div>
                <p className="text-gray-600 text-sm mt-2">
                    Tambahkan transaksi untuk melihat analisis keuanganmu.
                </p>
            </div>
        );
    }

    const ratio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

    let status = {
        text: "Belum Ada Data",
        color: "text-gray-500",
        emoji: "⚪",
        advice: "",
    };

    if (totalIncome > 0) {
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
                advice: "Lumayan stabil, tapi masih bisa disisihkan lebih banyak.",
            };
        } else if (ratio <= 100) {
            status = {
                text: "Waspada",
                color: "text-orange-600",
                emoji: "🟠",
                advice: "Pengeluaranmu hampir sama dengan pemasukan, coba evaluasi.",
            };
        } else {
            status = {
                text: "Boros / Tidak Sehat",
                color: "text-red-600",
                emoji: "🔴",
                advice: "Kamu mengeluarkan lebih dari pemasukanmu 😥, perlu kontrol lebih!",
            };
        }
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-indigo-500 transition hover:shadow-md">
            <div className="text-sm text-gray-500">Status Keuangan</div>
            <div className={`text-2xl font-bold mt-1 ${status.color}`}>
                {status.emoji} {status.text}
            </div>
            <p className="text-gray-600 text-sm mt-2">{status.advice}</p>
            <p className="text-xs text-gray-400 mt-1">
                Rasio pengeluaran: {ratio.toFixed(1)}%
            </p>

            {/* Optional progress bar visual */}
            <div className="w-full bg-gray-200 h-2 rounded-full mt-3 overflow-hidden">
                <div
                    className={`h-2 rounded-full transition-all ${ratio <= 50
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
        </div>
    );
}
