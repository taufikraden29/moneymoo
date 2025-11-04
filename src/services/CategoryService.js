import { supabase } from "../lib/supabaseClient";
import logger from "../utils/logger";

// Ambil semua kategori user
export async function getCategories(user_id) {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    // Log category retrieval
    logger.audit('Categories Retrieved', { 
      userId: user_id, 
      count: data.length,
      timestamp: new Date().toISOString() 
    });
    
    return data;
  } catch (error) {
    logger.audit('Categories Retrieval Failed', { 
      userId: user_id, 
      error: error.message,
      timestamp: new Date().toISOString() 
    });
    throw error;
  }
}

// Tambah kategori baru
export async function addCategory({ user_id, name, type }) {
  try {
    const { data, error } = await supabase
      .from("categories")
      .insert([{ user_id, name, type }])
      .select();

    if (error) throw error;
    
    // Log category creation
    logger.audit('Category Created', { 
      userId: user_id,
      categoryId: data[0].id,
      name,
      type,
      timestamp: new Date().toISOString() 
    });
    
    return data[0];
  } catch (error) {
    logger.audit('Category Creation Failed', { 
      userId: user_id,
      error: error.message,
      timestamp: new Date().toISOString() 
    });
    throw error;
  }
}

// Hapus kategori
export async function deleteCategory(id) {
  try {
    // Get the category before deletion for logging
    const { data: category, error: fetchError } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();
    
    if (fetchError) throw fetchError;

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
    
    // Log category deletion
    logger.audit('Category Deleted', { 
      userId: category.user_id,
      categoryId: id,
      deletedCategory: category,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    logger.audit('Category Deletion Failed', { 
      categoryId: id,
      error: error.message,
      timestamp: new Date().toISOString() 
    });
    throw error;
  }
}
