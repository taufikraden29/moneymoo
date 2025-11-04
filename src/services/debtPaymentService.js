// src/services/debtPaymentService.js
import { supabase } from "../lib/supabaseClient";
import logger from "../utils/logger";

// ✅ Ambil semua pembayaran berdasarkan debt_id
export const getDebtPayments = async (debt_id) => {
  try {
    const { data, error } = await supabase
      .from("debt_payments")
      .select("*")
      .eq("debt_id", debt_id)
      .order("payment_date", { ascending: false });

    if (error) throw error;
    
    // Log debt payments retrieval
    logger.audit('Debt Payments Retrieved', { 
      debtId: debt_id,
      count: data.length,
      timestamp: new Date().toISOString() 
    });
    
    return data;
  } catch (error) {
    logger.audit('Debt Payments Retrieval Failed', { 
      debtId: debt_id,
      error: error.message,
      timestamp: new Date().toISOString() 
    });
    throw error;
  }
};

// ✅ Tambah pembayaran hutang dan update sisa hutang otomatis
export const addDebtPayment = async (paymentData) => {
  try {
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

    // Log debt payment creation
    logger.audit('Debt Payment Created', { 
      debtId: paymentData.debt_id,
      paymentId: payment.id,
      amount: paymentData.amount,
      totalPaid,
      remaining,
      newStatus,
      timestamp: new Date().toISOString() 
    });

    return payment;
  } catch (error) {
    logger.audit('Debt Payment Creation Failed', { 
      debtId: paymentData.debt_id,
      error: error.message,
      paymentData,
      timestamp: new Date().toISOString() 
    });
    throw error;
  }
};

// ✅ Hapus pembayaran (tanpa update otomatis, bisa ditambah nanti)
export const deleteDebtPayment = async (id) => {
  try {
    // Get the payment before deletion for logging
    const { data: payment, error: fetchError } = await supabase
      .from("debt_payments")
      .select("*")
      .eq("id", id)
      .single();
    
    if (fetchError) throw fetchError;

    const { error } = await supabase.from("debt_payments").delete().eq("id", id);
    if (error) {
      logger.audit('Debt Payment Deletion Failed', { 
        paymentId: id,
        error: error.message,
        timestamp: new Date().toISOString() 
      });
      throw error;
    }

    // Log debt payment deletion
    logger.audit('Debt Payment Deleted', { 
      paymentId: id,
      deletedPayment: payment,
      debtId: payment.debt_id,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    logger.audit('Debt Payment Deletion Failed', { 
      paymentId: id,
      error: error.message,
      timestamp: new Date().toISOString() 
    });
    throw error;
  }
};
