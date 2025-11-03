// src/utils/currency.js

/**
 * Format angka ke format Rupiah Indonesia
 * @param {number} amount - Jumlah uang
 * @returns {string} - Format mata uang Rupiah
 */
export const formatRupiah = (amount) => {
  if (typeof amount === 'string') {
    amount = parseFloat(amount.replace(/\D/g, ''));
  }
  
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

/**
 * Hapus format Rupiah dan kembalikan angka
 * @param {string} formatted - String format Rupiah
 * @returns {number} - Nilai numerik
 */
export const parseRupiah = (formatted) => {
  if (typeof formatted !== 'string') return formatted || 0;
  
  const cleaned = formatted.replace(/[^\d]/g, '');
  return parseInt(cleaned) || 0;
};

/**
 * Format angka ke format ribuan dengan titik
 * @param {number} num - Angka yang akan diformat
 * @returns {string} - Format ribuan
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat("id-ID").format(num || 0);
};