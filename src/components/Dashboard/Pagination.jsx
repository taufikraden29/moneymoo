import { motion } from "framer-motion";

export default function Pagination({ 
  page, 
  totalPages, 
  setPage 
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-3 mt-6 flex-wrap">
      <button
        onClick={() => setPage((p) => Math.max(p - 1, 1))}
        disabled={page === 1}
        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        ⬅️ Prev
      </button>
      <span className="text-sm text-gray-700 px-3 py-2 bg-gray-50 rounded-lg">
        Halaman {page} dari {totalPages}
      </span>
      <button
        onClick={() =>
          setPage((p) => Math.min(p + 1, totalPages))
        }
        disabled={page === totalPages}
        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next ➡️
      </button>
    </div>
  );
}