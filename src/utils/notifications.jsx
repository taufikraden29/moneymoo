// src/utils/notifications.jsx
import toast from "react-hot-toast";

export const showSuccessToast = (message) => {
  toast.success(message);
};

export const showErrorToast = (message) => {
  toast.error(message);
};

export const showInfoToast = (message) => {
  toast(message);
};

export const showWarningToast = (message) => {
  toast(message, {
    icon: "⚠️",
    style: {
      borderRadius: "10px",
      background: "#fef3c7",
      color: "#92400e",
    },
  });
};

export const showConfirmationToast = (message, onConfirm, onCancel) => {
  toast(
    (t) => (
      <div className="flex flex-col items-start gap-3 p-2">
        <span className="text-gray-800 font-medium">{message}</span>
        <div className="flex gap-2 w-full">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              if (onConfirm) await onConfirm();
            }}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Ya
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              if (onCancel) onCancel();
            }}
            className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm hover:bg-gray-400 transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    ),
    {
      position: "top-center",
      duration: 5000,
    }
  );
};

// Fungsi untuk notifikasi transaksi
export const showTransactionSuccess = (type, amount) => {
  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
  
  toast.success(
    `✅ Transaksi ${type === 'income' ? 'pemasukan' : 'pengeluaran'} sebesar ${formattedAmount} berhasil disimpan!`
  );
};

export const showTransactionError = (error) => {
  toast.error(`❌ Gagal menyimpan transaksi: ${error.message}`);
};