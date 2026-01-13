import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, ArrowRightLeft, FileText, Target, BarChart3 } from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganization';
import FinanceDashboard from '@/components/finance/FinanceDashboard';
import TransactionsList from '@/components/finance/TransactionsList';
import TransactionForm from '@/components/finance/TransactionForm';
import InvoicesList from '@/components/finance/InvoicesList';
import InvoiceForm from '@/components/finance/InvoiceForm';
import BudgetsList from '@/components/finance/BudgetsList';
import BudgetForm from '@/components/finance/BudgetForm';
import FinanceReports from '@/components/finance/FinanceReports';
import { FinanceTransaction, Invoice, Budget } from '@/hooks/useFinance';

interface FinancePageProps {
  category: 'school' | 'church' | 'organization';
}

type ViewMode = 'list' | 'form' | 'view';

const FinancePage: React.FC<FinancePageProps> = ({ category }) => {
  const { t } = useTranslation();
  const { organization, loading: isLoading } = useOrganization();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactionView, setTransactionView] = useState<ViewMode>('list');
  const [invoiceView, setInvoiceView] = useState<ViewMode>('list');
  const [budgetView, setBudgetView] = useState<ViewMode>('list');
  const [selectedTransaction, setSelectedTransaction] = useState<FinanceTransaction | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Organisation non trouvée</p>
      </div>
    );
  }

  const currency = organization.currency || 'USD';

  const getTitle = () => {
    switch (category) {
      case 'church':
        return 'Dons & Finances';
      case 'school':
        return 'Finance & Comptabilité';
      default:
        return 'Finance & Comptabilité';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{getTitle()}</h1>
        <p className="text-muted-foreground">
          Gérez vos revenus, dépenses, factures et budgets
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutDashboard className="h-4 w-4 hidden sm:block" />
            Tableau
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2">
            <ArrowRightLeft className="h-4 w-4 hidden sm:block" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2">
            <FileText className="h-4 w-4 hidden sm:block" />
            Factures
          </TabsTrigger>
          <TabsTrigger value="budgets" className="gap-2">
            <Target className="h-4 w-4 hidden sm:block" />
            Budgets
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <BarChart3 className="h-4 w-4 hidden sm:block" />
            Rapports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <FinanceDashboard
            organizationId={organization.id}
            currency={currency}
            category={category}
          />
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          {transactionView === 'list' ? (
            <TransactionsList
              organizationId={organization.id}
              currency={currency}
              onAddClick={() => {
                setSelectedTransaction(null);
                setTransactionView('form');
              }}
              onEditClick={(transaction) => {
                setSelectedTransaction(transaction);
                setTransactionView('form');
              }}
            />
          ) : (
            <TransactionForm
              organizationId={organization.id}
              currency={currency}
              category={category}
              transaction={selectedTransaction}
              onBack={() => setTransactionView('list')}
            />
          )}
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          {invoiceView === 'list' ? (
            <InvoicesList
              organizationId={organization.id}
              currency={currency}
              onAddClick={() => {
                setSelectedInvoice(null);
                setInvoiceView('form');
              }}
              onViewClick={(invoice) => {
                setSelectedInvoice(invoice);
                setInvoiceView('view');
              }}
              onEditClick={(invoice) => {
                setSelectedInvoice(invoice);
                setInvoiceView('form');
              }}
            />
          ) : (
            <InvoiceForm
              organizationId={organization.id}
              currency={currency}
              category={category}
              invoice={selectedInvoice}
              onBack={() => setInvoiceView('list')}
            />
          )}
        </TabsContent>

        <TabsContent value="budgets" className="mt-6">
          {budgetView === 'list' ? (
            <BudgetsList
              organizationId={organization.id}
              currency={currency}
              onAddClick={() => {
                setSelectedBudget(null);
                setBudgetView('form');
              }}
              onEditClick={(budget) => {
                setSelectedBudget(budget);
                setBudgetView('form');
              }}
            />
          ) : (
            <BudgetForm
              organizationId={organization.id}
              currency={currency}
              budget={selectedBudget}
              onBack={() => setBudgetView('list')}
            />
          )}
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <FinanceReports
            organizationId={organization.id}
            currency={currency}
            category={category}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancePage;
