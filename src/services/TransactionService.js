// src/services/TransactionService.js
import { supabase } from "../lib/supabaseClient";

/**
 * Ambil transaksi dengan optional filter
 * filters = { user_id, from, to, type, category, q }
 */
export async function getTransactions(filters = {}) {
  const { user_id, from, to, type, category, q } = filters;
  let query = supabase.from("transactions").select("*");

  if (user_id) query = query.eq("user_id", user_id);
  if (type) query = query.eq("type", type);
  if (category) query = query.eq("category", category);
  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);

  // order by date desc
  query = query.order("date", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  // client-side simple search in description/category if q present
  if (q) {
    const qLower = q.toLowerCase();
    return (data || []).filter(
      (t) =>
        (t.description || "").toLowerCase().includes(qLower) ||
        (t.category || "").toLowerCase().includes(qLower)
    );
  }

  return data || [];
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
  return true; // Tambahkan ini
}

export const saveTransaction = async (transactionData) => {
  const { data, error } = await supabase
    .from("transactions")
    .insert([transactionData]);
  if (error) throw error;
  return data;
};