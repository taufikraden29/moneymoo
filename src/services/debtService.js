// src/services/debtService.js
import { supabase } from "../lib/supabaseClient";

// ✅ Ambil semua hutang berdasarkan user
export const getDebts = async (user_id) => {
  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const addDebt = async (data) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User belum login.");

    const payload = {
      user_id: user.id,
      account_id: data.account_id,
      provider: data.provider,
      monthly_payment: Number(data.monthly_payment),
      months: Number(data.months),
      // HAPUS total_amount karena kolom ini otomatis
      remaining_balance: Number(data.monthly_payment) * Number(data.months),
      status: "active",
      created_at: new Date().toISOString(),
    };

    console.log("Payload dikirim:", payload);

    const { data: insertedData, error } = await supabase
      .from("debts")
      .insert([payload])
      .select();

    if (error) throw error;
    return { success: true, data: insertedData };
  } catch (error) {
    console.error("Error adding debt:", error);
    return { success: false, error: error.message };
  }
};

// ✅ Update data hutang
export const updateDebt = async (id, updatedData) => {
  const { data, error } = await supabase
    .from("debts")
    .update(updatedData)
    .eq("id", id)
    .select();
  if (error) throw error;
  return data[0];
};

// ✅ Hapus hutang
export const deleteDebt = async (id) => {
  const { error } = await supabase.from("debts").delete().eq("id", id);
  if (error) throw error;
};
