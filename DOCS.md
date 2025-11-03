# Dokumentasi Aplikasi MoneyMoo

## Struktur Proyek
Aplikasi MoneyMoo adalah aplikasi pengelolaan keuangan pribadi yang dibangun dengan React dan Supabase.

### Struktur Folder
- `src/` - Sumber kode utama aplikasi
  - `components/` - Komponen-komponen UI
    - `Dashboard/` - Komponen-komponen untuk halaman dashboard
  - `hooks/` - Hook kustom
  - `pages/` - Halaman-halaman utama aplikasi
  - `services/` - Layanan untuk berinteraksi dengan API
  - `utils/` - Fungsi-fungsi utilitas
  - `lib/` - Konfigurasi dan library eksternal

## Fungsionalitas Utama

### 1. Autentikasi
- Registrasi pengguna dengan email dan password
- Login dan logout
- Reset password
- Validasi input

### 2. Manajemen Transaksi
- Menambahkan transaksi pemasukan/pengeluaran
- Mengedit transaksi
- Menghapus transaksi
- Filter dan pencarian transaksi

### 3. Kategori
- Membuat kategori transaksi
- Mengelola kategori

### 4. Akun
- Membuat akun (bank, e-wallet, tunai)
- Mengelola saldo akun

### 5. Dashboard
- Ringkasan keuangan harian dan keseluruhan
- Grafik distribusi pengeluaran/pemasukan
- Tampilan transaksi terbaru

## Hook Kustom

### useTransactions
Hook untuk mengelola semua operasi terkait transaksi:
- `loadTransactions()` - Memuat transaksi dengan filter
- `addTransaction(data)` - Menambahkan transaksi baru
- `updateTransactionData(id, data)` - Memperbarui transaksi
- `deleteTransactionData(id)` - Menghapus transaksi
- `calculateFinancialSummary()` - Menghitung ringkasan keuangan

## Utilitas

### currency.js
Fungsi untuk format mata uang:
- `formatRupiah(amount)` - Format ke Rupiah Indonesia
- `parseRupiah(formatted)` - Mengubah format Rupiah ke angka
- `formatNumber(num)` - Format angka ke ribuan

### notifications.js
Fungsi untuk menampilkan notifikasi:
- `showSuccessToast()`, `showErrorToast()`, dll.
- `showTransactionSuccess()`, `showTransactionError()` - Notifikasi khusus transaksi

## Komponen Utama

### Dashboard
- `DashboardHeader` - Header dashboard dengan aksi
- `FinancialOverviewCard` - Ringkasan keuangan
- `FilterSection` - Komponen filter transaksi
- `TransactionList` - Daftar transaksi
- `Pagination` - Komponen paginasi
- `MobileNav` - Navigasi bawah untuk mobile

## Kontribusi

Untuk berkontribusi pada proyek ini:
1. Fork repositori
2. Buat branch fitur baru
3. Lakukan perubahan
4. Commit dengan pesan yang jelas
5. Push ke branch
6. Buat pull request

## Lisensi

Proyek ini dilisensikan di bawah lisensi MIT.