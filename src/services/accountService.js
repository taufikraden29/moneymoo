import { supabase } from "../lib/supabaseClient";
import logger from "../utils/logger";

export async function getAccounts(userId) {
  try {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    
    // Log account retrieval
    logger.audit('Accounts Retrieved', { 
      userId, 
      count: data.length,
      timestamp: new Date().toISOString() 
    });
    
    return data;
  } catch (error) {
    logger.audit('Accounts Retrieval Failed', { 
      userId, 
      error: error.message,
      timestamp: new Date().toISOString() 
    });
    throw error;
  }
}

export async function addAccount(userId, name, type, bankNumber = null) {
  try {
    const { data, error } = await supabase
      .from("accounts")
      .insert([{ user_id: userId, name, type, bank_number: bankNumber }])
      .select();
    if (error) throw error;
    
    // Log account creation
    logger.audit('Account Created', { 
      userId,
      accountId: data[0].id,
      name,
      type,
      timestamp: new Date().toISOString() 
    });
    
    return "Akun berhasil ditambahkan!";
  } catch (error) {
    logger.audit('Account Creation Failed', { 
      userId,
      error: error.message,
      timestamp: new Date().toISOString() 
    });
    throw error;
  }
}

export async function deleteAccount(id) {
  try {
    // Get the account before deletion for logging
    const { data: account, error: fetchError } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", id)
      .single();
    
    if (fetchError) throw fetchError;

    const { error } = await supabase.from("accounts").delete().eq("id", id);
    if (error) throw error;
    
    // Log account deletion
    logger.audit('Account Deleted', { 
      userId: account.user_id,
      accountId: id,
      deletedAccount: account,
      timestamp: new Date().toISOString() 
    });
    
    return "Akun berhasil dihapus!";
  } catch (error) {
    logger.audit('Account Deletion Failed', { 
      accountId: id,
      error: error.message,
      timestamp: new Date().toISOString() 
    });
    throw error;
  }
}
