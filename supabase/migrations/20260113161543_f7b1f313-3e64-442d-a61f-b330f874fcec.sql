-- Create finance_categories table for categorizing transactions
CREATE TABLE public.finance_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_type TEXT NOT NULL, -- specific types per category: 'tuition', 'tithe', 'offering', 'donation', etc.
  description TEXT,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create finance_transactions table for all financial transactions
CREATE TABLE public.finance_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.finance_categories(id) ON DELETE SET NULL,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT,
  reference_number TEXT,
  payment_method TEXT, -- 'cash', 'card', 'bank_transfer', 'mobile_money', 'check', 'online'
  payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  notes TEXT,
  receipt_url TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled')),
  subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  discount_amount DECIMAL(15, 2) DEFAULT 0,
  total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(15, 2) DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_date DATE,
  notes TEXT,
  terms TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoice_items table
CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(15, 2) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create budgets table
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.finance_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  planned_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  actual_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  fiscal_year INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment_methods table for organization payment configuration
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'cash', 'card', 'bank', 'mobile_money', 'online'
  provider TEXT, -- 'stripe', 'paypal', 'mobile_money_provider'
  is_active BOOLEAN DEFAULT true,
  configuration JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create suppliers table for organization category
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_id TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase_orders table for organization category
CREATE TABLE public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'ordered', 'received', 'cancelled')),
  total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery DATE,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase_order_items table
CREATE TABLE public.purchase_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(15, 2) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all finance tables
ALTER TABLE public.finance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for finance_categories
CREATE POLICY "Users can view finance categories in their organizations"
ON public.finance_categories FOR SELECT
USING (public.is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Admins can manage finance categories"
ON public.finance_categories FOR ALL
USING (public.is_organization_admin(organization_id, auth.uid()));

-- RLS Policies for finance_transactions
CREATE POLICY "Users can view transactions in their organizations"
ON public.finance_transactions FOR SELECT
USING (public.is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Admins can manage transactions"
ON public.finance_transactions FOR ALL
USING (public.is_organization_admin(organization_id, auth.uid()));

-- RLS Policies for invoices
CREATE POLICY "Users can view invoices in their organizations"
ON public.invoices FOR SELECT
USING (public.is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Admins can manage invoices"
ON public.invoices FOR ALL
USING (public.is_organization_admin(organization_id, auth.uid()));

-- RLS Policies for invoice_items
CREATE POLICY "Users can view invoice items for their organization invoices"
ON public.invoice_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.invoices i
  WHERE i.id = invoice_items.invoice_id
  AND public.is_organization_member(i.organization_id, auth.uid())
));

CREATE POLICY "Admins can manage invoice items"
ON public.invoice_items FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.invoices i
  WHERE i.id = invoice_items.invoice_id
  AND public.is_organization_admin(i.organization_id, auth.uid())
));

-- RLS Policies for budgets
CREATE POLICY "Users can view budgets in their organizations"
ON public.budgets FOR SELECT
USING (public.is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Admins can manage budgets"
ON public.budgets FOR ALL
USING (public.is_organization_admin(organization_id, auth.uid()));

-- RLS Policies for payment_methods
CREATE POLICY "Users can view payment methods in their organizations"
ON public.payment_methods FOR SELECT
USING (public.is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Admins can manage payment methods"
ON public.payment_methods FOR ALL
USING (public.is_organization_admin(organization_id, auth.uid()));

-- RLS Policies for suppliers
CREATE POLICY "Users can view suppliers in their organizations"
ON public.suppliers FOR SELECT
USING (public.is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Admins can manage suppliers"
ON public.suppliers FOR ALL
USING (public.is_organization_admin(organization_id, auth.uid()));

-- RLS Policies for purchase_orders
CREATE POLICY "Users can view purchase orders in their organizations"
ON public.purchase_orders FOR SELECT
USING (public.is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Admins can manage purchase orders"
ON public.purchase_orders FOR ALL
USING (public.is_organization_admin(organization_id, auth.uid()));

-- RLS Policies for purchase_order_items
CREATE POLICY "Users can view purchase order items for their organization orders"
ON public.purchase_order_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.purchase_orders po
  WHERE po.id = purchase_order_items.purchase_order_id
  AND public.is_organization_member(po.organization_id, auth.uid())
));

CREATE POLICY "Admins can manage purchase order items"
ON public.purchase_order_items FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.purchase_orders po
  WHERE po.id = purchase_order_items.purchase_order_id
  AND public.is_organization_admin(po.organization_id, auth.uid())
));

-- Create indexes for better performance
CREATE INDEX idx_finance_categories_org ON public.finance_categories(organization_id);
CREATE INDEX idx_finance_transactions_org ON public.finance_transactions(organization_id);
CREATE INDEX idx_finance_transactions_date ON public.finance_transactions(transaction_date);
CREATE INDEX idx_finance_transactions_type ON public.finance_transactions(type);
CREATE INDEX idx_invoices_org ON public.invoices(organization_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_budgets_org ON public.budgets(organization_id);
CREATE INDEX idx_suppliers_org ON public.suppliers(organization_id);
CREATE INDEX idx_purchase_orders_org ON public.purchase_orders(organization_id);

-- Create triggers for updated_at
CREATE TRIGGER update_finance_categories_updated_at
BEFORE UPDATE ON public.finance_categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_finance_transactions_updated_at
BEFORE UPDATE ON public.finance_transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
BEFORE UPDATE ON public.budgets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
BEFORE UPDATE ON public.payment_methods
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
BEFORE UPDATE ON public.purchase_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();