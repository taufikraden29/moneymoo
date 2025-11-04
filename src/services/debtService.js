import { supabase } from '../lib/supabaseClient';
import logger from '../utils/logger';

export const debtService = {
  // ==================== DEBTS ====================
  async getDebts() {
    console.log('🔍 Getting debts for current user...');

    // Pastikan user terautentikasi
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.audit('Debt Retrieval Failed - Not Authenticated', { 
        timestamp: new Date().toISOString() 
      });
      throw new Error('User not authenticated');
    }

    console.log('👤 Current user:', user.id);

    try {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', user.id) // PASTIKAN filter by user_id
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error getting debts:', error);
        logger.audit('Debt Retrieval Failed', { 
          userId: user.id, 
          error: error.message,
          timestamp: new Date().toISOString() 
        });
        throw error;
      }

      console.log('✅ Debts loaded for user:', data?.length);
      
      // Log successful debt retrieval
      logger.audit('Debts Retrieved', { 
        userId: user.id, 
        count: data?.length || 0,
        timestamp: new Date().toISOString() 
      });
      
      return data;
    } catch (error) {
      logger.audit('Debt Retrieval Failed', { 
        userId: user.id, 
        error: error.message,
        timestamp: new Date().toISOString() 
      });
      throw error;
    }
  },

  async createDebt(debtData) {
    console.log('📝 Creating debt for current user...');

    // Dapatkan user yang sedang login
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.audit('Debt Creation Failed - Not Authenticated', { 
        timestamp: new Date().toISOString() 
      });
      throw new Error('User not authenticated');
    }

    // PASTIKAN user_id sesuai dengan user yang login
    const debtWithUser = {
      ...debtData,
      user_id: user.id, // Ini yang membuat data terisolasi per user
      status: 'active',
      created_at: new Date().toISOString()
    };

    console.log('🚀 Sending debt data with user_id:', user.id);

    try {
      const { data, error } = await supabase
        .from('debts')
        .insert([debtWithUser])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating debt:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        logger.audit('Debt Creation Failed', { 
          userId: user.id, 
          error: error.message,
          debtData: debtWithUser,
          timestamp: new Date().toISOString() 
        });
        throw error;
      }

      console.log('✅ Debt created successfully for user:', user.id);
      
      // Log successful debt creation
      logger.audit('Debt Created', { 
        userId: user.id, 
        debtId: data.id,
        debtData,
        timestamp: new Date().toISOString() 
      });
      
      return data;
    } catch (error) {
      logger.audit('Debt Creation Failed', { 
        userId: user.id, 
        error: error.message,
        debtData,
        timestamp: new Date().toISOString() 
      });
      throw error;
    }
  },

  async updateDebt(id, updates) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logger.audit('Debt Update Failed - Not Authenticated', { 
        debtId: id,
        timestamp: new Date().toISOString() 
      });
      throw new Error('User not authenticated');
    }

    try {
      // Get the debt before update for logging
      const { data: oldDebt, error: fetchError } = await supabase
        .from('debts')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id) // PASTIKAN hanya get data user sendiri
        .single();

      if (fetchError) throw fetchError;

      // Pastikan hanya bisa update debts milik sendiri
      const { data, error } = await supabase
        .from('debts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id) // PASTIKAN hanya update data user sendiri
        .select()
        .single();

      if (error) {
        logger.audit('Debt Update Failed', { 
          userId: user.id, 
          debtId: id,
          error: error.message,
          updates,
          timestamp: new Date().toISOString() 
        });
        throw error;
      }

      // Log successful debt update
      logger.audit('Debt Updated', { 
        userId: user.id, 
        debtId: id,
        oldData: oldDebt,
        newData: data,
        updates,
        timestamp: new Date().toISOString() 
      });

      return data;
    } catch (error) {
      logger.audit('Debt Update Failed', { 
        userId: user.id, 
        debtId: id,
        error: error.message,
        updates,
        timestamp: new Date().toISOString() 
      });
      throw error;
    }
  },

  async deleteDebt(id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logger.audit('Debt Deletion Failed - Not Authenticated', { 
        debtId: id,
        timestamp: new Date().toISOString() 
      });
      throw new Error('User not authenticated');
    }

    try {
      // Get the debt before deletion for logging
      const { data: debt, error: fetchError } = await supabase
        .from('debts')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id) // PASTIKAN hanya get data user sendiri
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // PASTIKAN hanya delete data user sendiri

      if (error) {
        logger.audit('Debt Deletion Failed', { 
          userId: user.id, 
          debtId: id,
          error: error.message,
          timestamp: new Date().toISOString() 
        });
        throw error;
      }

      // Log successful debt deletion
      logger.audit('Debt Deleted', { 
        userId: user.id, 
        debtId: id,
        deletedDebt: debt,
        timestamp: new Date().toISOString() 
      });
    } catch (error) {
      logger.audit('Debt Deletion Failed', { 
        userId: user.id, 
        debtId: id,
        error: error.message,
        timestamp: new Date().toISOString() 
      });
      throw error;
    }
  },

  // ==================== DEBT PAYMENTS ====================
  async getDebtPayments(debtId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('debt_payments')
      .select(`
        *,
        accounts(name, type)
      `)
      .eq('debt_id', debtId)
      // RLS akan otomatis filter berdasarkan ownership debt
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createDebtPayment(paymentData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    try {
      // 1️⃣ Tambahkan pembayaran baru
      const { data: payment, error } = await supabase
        .from('debt_payments')
        .insert([{
          ...paymentData,
          created_at: new Date().toISOString()
        }])
        .select(`
          *,
          accounts(name, type)
        `)
        .single();

      if (error) throw error;

      // 2️⃣ Hitung total pembayaran untuk debt ini
      const { data: payments, error: sumError } = await supabase
        .from('debt_payments')
        .select('amount')
        .eq('debt_id', paymentData.debt_id);

      if (sumError) throw sumError;

      const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

      // 3️⃣ Ambil data hutang untuk menghitung sisa
      const { data: debt, error: debtError } = await supabase
        .from('debts')
        .select('total_amount')
        .eq('id', paymentData.debt_id)
        .single();

      if (debtError) throw debtError;

      // 4️⃣ Hitung sisa hutang
      const remaining = debt.total_amount - totalPaid;
      const newStatus = remaining <= 0 ? 'paid' : 'active';

      // 5️⃣ Update sisa hutang dan status hutang
      const { error: debtUpdateError } = await supabase
        .from('debts')
        .update({
          remaining_amount: remaining, // Menggunakan field yang benar: remaining_amount
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentData.debt_id);

      if (debtUpdateError) throw debtUpdateError;

      // 6️⃣ Update saldo akun karena pembayaran utang mengurangi saldo
      if (payment.account_id) {
        const { data: accountData, error: accountError } = await supabase
          .from('accounts')
          .select('balance')
          .eq('id', payment.account_id)
          .single();

        if (accountError) throw accountError;

        const currentBalance = parseFloat(accountData.balance || 0);
        const newBalance = currentBalance - payment.amount;

        const { error: updateAccountError } = await supabase
          .from('accounts')
          .update({ 
            balance: newBalance
            // Menghapus updated_at karena field ini mungkin tidak ada di tabel accounts
          })
          .eq('id', payment.account_id);

        if (updateAccountError) throw updateAccountError;
      }

      return payment;
    } catch (error) {
      console.error('Error in createDebtPayment:', error);
      // Melempar error yang lebih deskriptif
      throw new Error(`Gagal mencatat pembayaran: ${error.message}`);
    }
  },

  // ==================== SUMMARY & REPORTS ====================
  async getDebtSummary() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('debt_summary')
      .select('*')
      .eq('user_id', user.id) // FILTER by user_id
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getDebtStats() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: debts } = await supabase
      .from('debt_summary')
      .select('type, total_amount, remaining_amount, status')
      .eq('user_id', user.id); // HITUNG stats hanya untuk user ini

    if (!debts) return null;

    const stats = debts.reduce((acc, debt) => {
      if (debt.type === 'debt') {
        acc.totalDebt += debt.total_amount;
        acc.remainingDebt += debt.remaining_amount;
        if (debt.status === 'active') acc.activeDebts++;
      } else {
        acc.totalReceivable += debt.total_amount;
        acc.remainingReceivable += debt.remaining_amount;
        if (debt.status === 'active') acc.activeReceivables++;
      }
      return acc;
    }, {
      totalDebt: 0,
      remainingDebt: 0,
      totalReceivable: 0,
      remainingReceivable: 0,
      activeDebts: 0,
      activeReceivables: 0
    });

    return stats;
  }
};