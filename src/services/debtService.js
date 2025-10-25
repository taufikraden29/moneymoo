import { supabase } from '../lib/supabaseClient';

export const debtService = {
  // ==================== DEBTS ====================
  async getDebts() {
    console.log('🔍 Getting debts for current user...');

    // Pastikan user terautentikasi
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    console.log('👤 Current user:', user.id);

    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', user.id) // PASTIKAN filter by user_id
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error getting debts:', error);
      throw error;
    }

    console.log('✅ Debts loaded for user:', data?.length);
    return data;
  },

  async createDebt(debtData) {
    console.log('📝 Creating debt for current user...');

    // Dapatkan user yang sedang login
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
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
      throw error;
    }

    console.log('✅ Debt created successfully for user:', user.id);
    return data;
  },

  async updateDebt(id, updates) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Pastikan hanya bisa update debts milik sendiri
    const { data, error } = await supabase
      .from('debts')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id) // PASTIKAN hanya update data user sendiri
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteDebt(id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // PASTIKAN hanya delete data user sendiri

    if (error) throw error;
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

    const { data, error } = await supabase
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
    return data;
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