import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types
export interface FinanceCategory {
  id: string;
  organization_id: string;
  name: string;
  type: 'income' | 'expense';
  category_type: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinanceTransaction {
  id: string;
  organization_id: string;
  category_id?: string;
  member_id?: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  description?: string;
  reference_number?: string;
  payment_method?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  transaction_date: string;
  due_date?: string;
  notes?: string;
  receipt_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  category?: FinanceCategory;
  member?: { first_name: string; last_name: string };
}

export interface Invoice {
  id: string;
  organization_id: string;
  member_id?: string;
  invoice_number: string;
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  amount_paid: number;
  currency: string;
  issue_date: string;
  due_date?: string;
  paid_date?: string;
  notes?: string;
  terms?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  member?: { first_name: string; last_name: string };
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  created_at: string;
}

export interface Budget {
  id: string;
  organization_id: string;
  category_id?: string;
  name: string;
  type: 'income' | 'expense';
  planned_amount: number;
  actual_amount: number;
  currency: string;
  period_start: string;
  period_end: string;
  fiscal_year?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  category?: FinanceCategory;
}

// Finance Categories Hooks
export const useFinanceCategories = (organizationId: string | undefined) => {
  return useQuery({
    queryKey: ['finance-categories', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from('finance_categories')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name');
      
      if (error) throw error;
      return data as FinanceCategory[];
    },
    enabled: !!organizationId,
  });
};

export const useCreateFinanceCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (category: Omit<FinanceCategory, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('finance_categories')
        .insert(category)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['finance-categories', variables.organization_id] });
      toast.success('Catégorie créée avec succès');
    },
    onError: (error) => {
      toast.error('Erreur lors de la création de la catégorie');
      console.error(error);
    },
  });
};

// Finance Transactions Hooks
export const useFinanceTransactions = (organizationId: string | undefined, filters?: {
  type?: 'income' | 'expense';
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['finance-transactions', organizationId, filters],
    queryFn: async () => {
      if (!organizationId) return [];
      
      let query = supabase
        .from('finance_transactions')
        .select(`
          *,
          category:finance_categories(*),
          member:members(first_name, last_name)
        `)
        .eq('organization_id', organizationId)
        .order('transaction_date', { ascending: false });
      
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.startDate) {
        query = query.gte('transaction_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('transaction_date', filters.endDate);
      }
      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      if (filters?.status) {
        query = query.eq('payment_status', filters.status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as FinanceTransaction[];
    },
    enabled: !!organizationId,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (transaction: Omit<FinanceTransaction, 'id' | 'created_at' | 'updated_at' | 'category' | 'member'>) => {
      const { data, error } = await supabase
        .from('finance_transactions')
        .insert({ ...transaction, created_by: user?.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['finance-transactions', variables.organization_id] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary', variables.organization_id] });
      toast.success('Transaction enregistrée avec succès');
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'enregistrement de la transaction');
      console.error(error);
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FinanceTransaction> & { id: string }) => {
      const { data, error } = await supabase
        .from('finance_transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance-transactions', data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary', data.organization_id] });
      toast.success('Transaction mise à jour');
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, organizationId }: { id: string; organizationId: string }) => {
      const { error } = await supabase
        .from('finance_transactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, organizationId };
    },
    onSuccess: ({ organizationId }) => {
      queryClient.invalidateQueries({ queryKey: ['finance-transactions', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary', organizationId] });
      toast.success('Transaction supprimée');
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression');
      console.error(error);
    },
  });
};

// Invoice Hooks
export const useInvoices = (organizationId: string | undefined, status?: string) => {
  return useQuery({
    queryKey: ['invoices', organizationId, status],
    queryFn: async () => {
      if (!organizationId) return [];
      
      let query = supabase
        .from('invoices')
        .select(`
          *,
          member:members(first_name, last_name)
        `)
        .eq('organization_id', organizationId)
        .order('issue_date', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Invoice[];
    },
    enabled: !!organizationId,
  });
};

export const useInvoice = (invoiceId: string | undefined) => {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;
      
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          member:members(first_name, last_name)
        `)
        .eq('id', invoiceId)
        .single();
      
      if (invoiceError) throw invoiceError;
      
      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at');
      
      if (itemsError) throw itemsError;
      
      return { ...invoice, items } as Invoice;
    },
    enabled: !!invoiceId,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ items, ...invoice }: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'member' | 'items'> & { items: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>[] }) => {
      // Create invoice
      const { data: newInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({ ...invoice, created_by: user?.id })
        .select()
        .single();
      
      if (invoiceError) throw invoiceError;
      
      // Create invoice items
      if (items && items.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(items.map(item => ({ ...item, invoice_id: newInvoice.id })));
        
        if (itemsError) throw itemsError;
      }
      
      return newInvoice;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', data.organization_id] });
      toast.success('Facture créée avec succès');
    },
    onError: (error) => {
      toast.error('Erreur lors de la création de la facture');
      console.error(error);
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Invoice> & { id: string }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.id] });
      toast.success('Facture mise à jour');
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
    },
  });
};

// Budget Hooks
export const useBudgets = (organizationId: string | undefined, fiscalYear?: number) => {
  return useQuery({
    queryKey: ['budgets', organizationId, fiscalYear],
    queryFn: async () => {
      if (!organizationId) return [];
      
      let query = supabase
        .from('budgets')
        .select(`
          *,
          category:finance_categories(*)
        `)
        .eq('organization_id', organizationId)
        .order('period_start', { ascending: false });
      
      if (fiscalYear) {
        query = query.eq('fiscal_year', fiscalYear);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Budget[];
    },
    enabled: !!organizationId,
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (budget: Omit<Budget, 'id' | 'created_at' | 'updated_at' | 'category'>) => {
      const { data, error } = await supabase
        .from('budgets')
        .insert(budget)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets', variables.organization_id] });
      toast.success('Budget créé avec succès');
    },
    onError: (error) => {
      toast.error('Erreur lors de la création du budget');
      console.error(error);
    },
  });
};

// Financial Summary Hook
export const useFinanceSummary = (organizationId: string | undefined, period?: { start: string; end: string }) => {
  return useQuery({
    queryKey: ['finance-summary', organizationId, period],
    queryFn: async () => {
      if (!organizationId) return null;
      
      const startDate = period?.start || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
      const endDate = period?.end || new Date().toISOString().split('T')[0];
      
      const { data: transactions, error } = await supabase
        .from('finance_transactions')
        .select('type, amount, payment_status')
        .eq('organization_id', organizationId)
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .eq('payment_status', 'completed');
      
      if (error) throw error;
      
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const { data: pendingInvoices } = await supabase
        .from('invoices')
        .select('total_amount, amount_paid')
        .eq('organization_id', organizationId)
        .in('status', ['sent', 'partial', 'overdue']);
      
      const pendingAmount = (pendingInvoices || [])
        .reduce((sum, inv) => sum + (Number(inv.total_amount) - Number(inv.amount_paid)), 0);
      
      return {
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        pendingAmount,
        transactionCount: transactions.length,
      };
    },
    enabled: !!organizationId,
  });
};
