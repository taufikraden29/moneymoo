// src/services/TransactionService.js
import { supabase } from "../lib/supabaseClient";

/**
 * Ambil transaksi dengan optional filter
 * filters = { user_id, from, to, type, category, q, limit, offset }
 */
export async function getTransactions(filters = {}) {
  const { user_id, from, to, type, category, q, limit = 10, offset = 0 } = filters;
  
  let query = supabase
    .from("transactions")
    .select(`
      *,
      accounts:account_id (
        id,
        name,
        type
      )
    `, { count: "exact" })
    .eq("user_id", user_id)
    .order("date", { ascending: false });

  // Apply filters
  if (type) query = query.eq("type", type);
  if (category) query = query.eq("category", category);
  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);
  if (q) query = query.ilike("description", `%${q}%`);

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    data: data || [],
    count: count || 0
  };
}

export async function updateTransaction(id, payload) {
  const { data, error } = await supabase
    .from("transactions")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTransaction(id) {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export const saveTransaction = async (transactionData) => {
  const { data, error } = await supabase
    .from("transactions")
    .insert([transactionData])
    .select();
  if (error) throw error;
  return data;
};

/**
 * Fungsi untuk memperbarui saldo akun setelah transaksi
 */
export async function updateAccountBalance(transactionData, isUpdate = false, oldTransaction = null) {
  if (!transactionData.account_id) return;
  
  const { data: accountData, error: accountError } = await supabase
    .from("accounts")
    .select("balance")
    .eq("id", transactionData.account_id)
    .single();
    
  if (accountError) throw accountError;
  
  let newBalance = parseFloat(accountData.balance || 0);
  const amount = parseFloat(transactionData.amount);
  
  // Jika ini update, kita perlu membatalkan transaksi lama terlebih dahulu
  if (isUpdate && oldTransaction) {
    const oldAmount = parseFloat(oldTransaction.amount);
    if (oldTransaction.type === "income") {
      newBalance -= oldAmount; // Batalkan pemasukan lama
    } else {
      newBalance += oldAmount; // Batalkan pengeluaran lama
    }
  }
  
  // Tambahkan/mengurangi saldo berdasarkan tipe transaksi
  if (transactionData.type === "income") {
    newBalance += amount;
  } else {
    newBalance -= amount;
  }
  
  // Update saldo akun
  const { error: updateError } = await supabase
    .from("accounts")
    .update({ balance: newBalance })
    .eq("id", transactionData.account_id);
    
  if (updateError) throw updateError;
  
  return newBalance;
}

/**
 * Fungsi untuk mendapatkan ringkasan keuangan
 */
export async function getFinancialSummary(userId, filters = {}) {
  const { from, to } = filters;
  
  let query = supabase
    .from("transactions")
    .select("type, amount", { count: "exact" });
  
  query = query.eq("user_id", userId);
  
  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  const totalIncome = data
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
  const totalExpense = data
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
  const balance = totalIncome - totalExpense;
  
  return {
    totalIncome,
    totalExpense,
    balance,
    transactionCount: data.length
  };
}