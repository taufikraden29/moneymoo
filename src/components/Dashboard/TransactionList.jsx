import { motion } from "framer-motion";

export default function TransactionList({ 
  transactions, 
  groupedTransactions, 
  loading, 
  openEdit, 
  handleDelete,
  isMobile 
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-6xl mb-4">📝</div>
        <p className="text-gray-500 text-sm">Belum ada transaksi</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groupedTransactions.map(([dateStr, trxs]) => {
        const today = new Date();
        const trxDate = new Date(dateStr);
        const diffDays = Math.floor(
          (today - trxDate) / (1000 * 60 * 60 * 24)
        );

        const label =
          diffDays === 0
            ? "📅 Hari Ini"
            : diffDays === 1
            ? "📆 Kemarin"
            : trxDate.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "2-digit",
                month: "short",
                year: "numeric",
              });

        return (
          <div key={dateStr} className="space-y-3">
            <h3 className="font-semibold text-gray-700 text-sm border-b border-gray-200 pb-2 sticky top-16 bg-white/80 backdrop-blur-sm py-2">
              {label}
            </h3>
            <div className="space-y-2">
              {trxs.map((trx) => {
                const date = new Date(trx.created_at || trx.date);
                const tanggal = date.toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                const waktu = date.toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <motion.div
                    key={trx.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="flex justify-between items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <div className="font-medium text-gray-800 truncate">
                          {trx.category}
                        </div>
                        <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border">
                          {trx.accounts?.name || "Tanpa Akun"}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {trx.description || "-"}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {tanggal} • {waktu}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <div
                        className={`font-semibold text-sm whitespace-nowrap ${
                          trx.type === "income"
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {trx.type === "income" ? "+" : "-"} Rp{" "}
                        {Number(trx.amount).toLocaleString("id-ID")}
                      </div>
                      <div
                        className={`flex gap-1 ${
                          isMobile
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        } transition-opacity`}
                      >
                        <button
                          onClick={() => openEdit(trx)}
                          className="p-1 bg-yellow-100 hover:bg-yellow-200 rounded transition-colors"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(trx.id)}
                          className="p-1 bg-red-100 hover:bg-red-200 rounded transition-colors"
                          title="Hapus"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}