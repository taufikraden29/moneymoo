import { supabase } from "../lib/supabaseClient";

export async function getAccounts(userId) {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addAccount(userId, name, type, bankNumber = null) {
  const { error } = await supabase
    .from("accounts")
    .insert([{ user_id: userId, name, type, bank_number: bankNumber }]);
  if (error) throw error;
  return "Akun berhasil ditambahkan!";
}

export async function deleteAccount(id) {
  const { error } = await supabase.from("accounts").delete().eq("id", id);
  if (error) throw error;
  return "Akun berhasil dihapus!";
}
