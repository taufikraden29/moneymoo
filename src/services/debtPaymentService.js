// src/services/debtPaymentService.js
import { supabase } from "../lib/supabaseClient";

// ✅ Ambil semua pembayaran berdasarkan debt_id
export const getDebtPayments = async (debt_id) => {
  const { data, error } = await supabase
    .from("debt_payments")
    .select("*")
    .eq("debt_id", debt_id)
    .order("payment_date", { ascending: false });

  if (error) throw error;
  return data;
};

// ✅ Tambah pembayaran hutang dan update sisa hutang otomatis
export const addDebtPayment = async (paymentData) => {
  // 1️⃣ Tambahkan pembayaran baru
  const { data: payment, error } = await supabase
    .from("debt_payments")
    .insert([paymentData])
    .select()
    .single();
  if (error) throw error;

  // 2️⃣ Hitung total pembayaran sejauh ini
  const { data: payments, error: sumError } = await supabase
    .from("debt_payments")
    .select("amount")
    .eq("debt_id", paymentData.debt_id);

  if (sumError) throw sumError;

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  // 3️⃣ Ambil data hutang lama
  const { data: debt, error: debtError } = await supabase
    .from("debts")
    .select("total_amount")
    .eq("id", paymentData.debt_id)
    .single();

  if (debtError) throw debtError;

  // 4️⃣ Hitung sisa hutang
  const remaining = debt.total_amount - totalPaid;

  // 5️⃣ Update sisa hutang dan status
  const newStatus = remaining <= 0 ? "paid" : "ongoing";

  const { error: updateError } = await supabase
    .from("debts")
    .update({
      remaining_balance: remaining,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentData.debt_id);

  if (updateError) throw updateError;

  return payment;
};

// ✅ Hapus pembayaran (tanpa update otomatis, bisa ditambah nanti)
export const deleteDebtPayment = async (id) => {
  const { error } = await supabase.from("debt_payments").delete().eq("id", id);
  if (error) throw error;
};
