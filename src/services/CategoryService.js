import { supabase } from "../lib/supabaseClient";

// Ambil semua kategori user
export async function getCategories(user_id) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Tambah kategori baru
export async function addCategory({ user_id, name, type }) {
  const { data, error } = await supabase
    .from("categories")
    .insert([{ user_id, name, type }])
    .select();

  if (error) throw error;
  return data[0];
}

// Hapus kategori
export async function deleteCategory(id) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}
