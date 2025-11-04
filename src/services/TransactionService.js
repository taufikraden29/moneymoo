// src/services/TransactionService.js
import { supabase } from "../lib/supabaseClient";
import ErrorHandler from "../utils/errorHandler";
import cache from "../utils/cache";
import logger from "../utils/logger";

/**
 * Ambil transaksi dengan optional filter
 * filters = { user_id, from, to, type, category, q, limit, offset }
 */
export async function getTransactions(filters = {}) {
  const { user_id, from, to, type, category, q, limit = 10, offset = 0 } = filters;
  
  // Create cache key based on filters
  const cacheKey = `transactions_${user_id}_${JSON.stringify(filters)}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    return cachedResult;
  }
  
  try {
    // Validasi input
    const validationErrors = ErrorHandler.validate(
      { user_id },
      {
        user_id: { required: true }
      }
    );

    if (validationErrors.length > 0) {
      throw new Error(validationErrors[0]); // Return the first validation error
    }

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
      .eq("user_id", ErrorHandler.sanitizeInput(user_id))
      .order("date", { ascending: false });

    // Apply filters
    if (type) query = query.eq("type", ErrorHandler.sanitizeInput(type));
    if (category) query = query.eq("category", ErrorHandler.sanitizeInput(category));
    if (from) query = query.gte("date", ErrorHandler.sanitizeInput(from));
    if (to) query = query.lte("date", ErrorHandler.sanitizeInput(to));
    if (q) query = query.ilike("description", `%${ErrorHandler.sanitizeInput(q)}%`);

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    const result = {
      data: data || [],
      count: count || 0
    };
    
    // Cache the result for 30 seconds (for frequently accessed data)
    cache.set(cacheKey, result, 30 * 1000);

    // Log transaction retrieval
    logger.audit('Transaction Retrieval', { 
      userId: user_id, 
      count: result.count,
      timestamp: new Date().toISOString() 
    });

    return result;
  } catch (error) {
    logger.audit('Transaction Retrieval Failed', { 
      userId: user_id, 
      error: error.message,
      timestamp: new Date().toISOString() 
    });
    ErrorHandler.handle(error, 'Transaction Service - Get Transactions');
    throw error;
  }
}

export async function updateTransaction(id, payload) {
  try {
    // Validasi input
    const validationErrors = ErrorHandler.validate(
      { id, ...payload },
      {
        id: { required: true },
        amount: { 
          required: true,
          custom: (val) => (!val || isNaN(val) || parseFloat(val) <= 0) ? 'Jumlah transaksi harus lebih besar dari 0' : null
        }
      }
    );

    if (validationErrors.length > 0) {
      throw new Error(validationErrors[0]); // Return the first validation error
    }

    // Get the old transaction for logging
    const { data: oldTransaction, error: fetchError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single();
    
    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from("transactions")
      .update({
        ...payload,
        amount: parseFloat(payload.amount),
        description: ErrorHandler.sanitizeInput(payload.description),
        category: ErrorHandler.sanitizeInput(payload.category),
        type: ErrorHandler.sanitizeInput(payload.type),
        date: ErrorHandler.sanitizeInput(payload.date)
      })
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Invalidate cache for this transaction
    const cacheKeys = cache.keys();
    cacheKeys.forEach(key => {
      if (key.includes('transactions_')) {
        cache.delete(key);
      }
    });
    
    // Log transaction update
    logger.audit('Transaction Updated', { 
      userId: oldTransaction.user_id,
      transactionId: id,
      oldData: oldTransaction,
      newData: payload,
      timestamp: new Date().toISOString() 
    });
    
    return data;
  } catch (error) {
    logger.audit('Transaction Update Failed', { 
      transactionId: id,
      error: error.message,
      timestamp: new Date().toISOString() 
    });
    ErrorHandler.handle(error, 'Transaction Service - Update Transaction');
    throw error;
  }
}

export async function deleteTransaction(id) {
  try {
    // Validasi input
    const validationErrors = ErrorHandler.validate(
      { id },
      {
        id: { required: true }
      }
    );

    if (validationErrors.length > 0) {
      throw new Error(validationErrors[0]); // Return the first validation error
    }

    // Get the transaction before deletion for logging
    const { data: transaction, error: fetchError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single();
    
    if (fetchError) throw fetchError;

    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) throw error;
    
    // Invalidate cache after deletion
    const cacheKeys = cache.keys();
    cacheKeys.forEach(key => {
      if (key.includes('transactions_')) {
        cache.delete(key);
      }
    });
    
    // Log transaction deletion
    logger.audit('Transaction Deleted', { 
      userId: transaction.user_id,
      transactionId: id,
      deletedData: transaction,
      timestamp: new Date().toISOString() 
    });
    
    return true;
  } catch (error) {
    logger.audit('Transaction Deletion Failed', { 
      transactionId: id,
      error: error.message,
      timestamp: new Date().toISOString() 
    });
    ErrorHandler.handle(error, 'Transaction Service - Delete Transaction');
    throw error;
  }
}

export const saveTransaction = async (transactionData) => {
  try {
    // Validasi data transaksi
    const validationErrors = ErrorHandler.validate(
      transactionData,
      {
        amount: { 
          required: true,
          custom: (val) => (!val || isNaN(val) || parseFloat(val) <= 0) ? 'Jumlah transaksi harus lebih besar dari 0' : null
        },
        category: { required: true },
        date: { required: true },
        type: { required: true }
      }
    );

    if (validationErrors.length > 0) {
      throw new Error(validationErrors[0]); // Return the first validation error
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert([{
        ...transactionData,
        amount: parseFloat(transactionData.amount),
        description: ErrorHandler.sanitizeInput(transactionData.description),
        category: ErrorHandler.sanitizeInput(transactionData.category),
        type: ErrorHandler.sanitizeInput(transactionData.type),
        date: ErrorHandler.sanitizeInput(transactionData.date)
      }])
      .select();
    
    if (error) throw error;
    
    // Invalidate cache after insertion
    const cacheKeys = cache.keys();
    cacheKeys.forEach(key => {
      if (key.includes('transactions_')) {
        cache.delete(key);
      }
    });
    
    // Log transaction creation
    logger.audit('Transaction Created', { 
      userId: transactionData.user_id,
      transactionId: data[0].id,
      type: transactionData.type,
      amount: transactionData.amount,
      description: transactionData.description,
      timestamp: new Date().toISOString() 
    });
    
    return data;
  } catch (error) {
    logger.audit('Transaction Creation Failed', { 
      userId: transactionData.user_id,
      error: error.message,
      timestamp: new Date().toISOString() 
    });
    ErrorHandler.handle(error, 'Transaction Service - Save Transaction');
    throw error;
  }
};

/**
 * Fungsi untuk memperbarui saldo akun setelah transaksi
 */
export async function updateAccountBalance(transactionData, isUpdate = false, oldTransaction = null) {
  try {
    if (!transactionData.account_id) return;
    
    // Validasi data transaksi
    const validationErrors = ErrorHandler.validate(
      { account_id: transactionData.account_id, amount: transactionData.amount },
      {
        account_id: { required: true },
        amount: { 
          required: true,
          custom: (val) => (!val || isNaN(val)) ? 'Jumlah transaksi harus berupa angka' : null
        }
      }
    );

    if (validationErrors.length > 0) {
      throw new Error(validationErrors[0]); // Return the first validation error
    }
    
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
  } catch (error) {
    ErrorHandler.handle(error, 'Transaction Service - Update Account Balance');
    throw error;
  }
}

/**
 * Fungsi untuk mendapatkan ringkasan keuangan
 */
export async function getFinancialSummary(userId, filters = {}) {
  const cacheKey = `financial_summary_${userId}_${JSON.stringify(filters)}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    return cachedResult;
  }
  
  try {
    // Validasi input
    const validationErrors = ErrorHandler.validate(
      { user_id: userId },
      {
        user_id: { required: true }
      }
    );

    if (validationErrors.length > 0) {
      throw new Error(validationErrors[0]); // Return the first validation error
    }

    const { from, to } = filters;
    
    let query = supabase
      .from("transactions")
      .select("type, amount", { count: "exact" });
    
    query = query.eq("user_id", ErrorHandler.sanitizeInput(userId));
    
    if (from) query = query.gte("date", ErrorHandler.sanitizeInput(from));
    if (to) query = query.lte("date", ErrorHandler.sanitizeInput(to));
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const totalIncome = data
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
    const totalExpense = data
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
    const balance = totalIncome - totalExpense;
    
    const result = {
      totalIncome,
      totalExpense,
      balance,
      transactionCount: data.length
    };
    
    // Cache financial summary for 1 minute (as it's more static)
    cache.set(cacheKey, result, 60 * 1000);

    return result;
  } catch (error) {
    ErrorHandler.handle(error, 'Transaction Service - Get Financial Summary');
    throw error;
  }
}