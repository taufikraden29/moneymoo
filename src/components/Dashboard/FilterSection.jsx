import { motion, AnimatePresence } from "framer-motion";

export default function FilterSection({ 
  showFilters, 
  isMobile, 
  from, 
  to, 
  filterType, 
  filterCategory, 
  q, 
  categories, 
  setFrom, 
  setTo, 
  setFilterType, 
  setFilterCategory, 
  setQ 
}) {
  return (
    <AnimatePresence>
      {(showFilters || !isMobile) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-6 overflow-hidden"
        >
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            placeholder="Dari tanggal"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            placeholder="Sampai tanggal"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          >
            <option value="">Semua Tipe</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Cari deskripsi..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm col-span-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}