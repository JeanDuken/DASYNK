import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank
} from 'lucide-react';
import { useFinanceSummary, useFinanceTransactions, useInvoices } from '@/hooks/useFinance';
import { formatCurrency } from '@/lib/currencies';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FinanceDashboardProps {
  organizationId: string;
  currency: string;
  category: 'school' | 'church' | 'organization';
}

const FinanceDashboard: React.FC<FinanceDashboardProps> = ({
  organizationId,
  currency,
  category,
}) => {
  const { t } = useTranslation();
  const { data: summary, isLoading: summaryLoading } = useFinanceSummary(organizationId);
  const { data: transactions } = useFinanceTransactions(organizationId);
  const { data: invoices } = useInvoices(organizationId);

  const recentTransactions = transactions?.slice(0, 5) || [];
  const pendingInvoices = invoices?.filter(inv => ['sent', 'partial', 'overdue'].includes(inv.status)).slice(0, 5) || [];

  const getCategoryLabel = () => {
    switch (category) {
      case 'church':
        return { income: 'Dons & Offrandes', expense: 'Dépenses Église' };
      case 'school':
        return { income: 'Frais Scolaires', expense: 'Dépenses École' };
      default:
        return { income: 'Revenus', expense: 'Dépenses' };
    }
  };

  const labels = getCategoryLabel();

  if (summaryLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {labels.income}
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary?.totalIncome || 0, currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cette année
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {labels.expense}
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary?.totalExpenses || 0, currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cette année
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Solde Net
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <PiggyBank className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(summary?.netBalance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary?.netBalance || 0, currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenus - Dépenses
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En Attente
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(summary?.pendingAmount || 0, currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Factures impayées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Transactions Récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune transaction récente
              </p>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' 
                          ? 'bg-green-100' 
                          : 'bg-red-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {transaction.description || transaction.category?.name || 'Transaction'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transaction.transaction_date), 'dd MMM yyyy', { locale: fr })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Factures en Attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune facture en attente
              </p>
            ) : (
              <div className="space-y-4">
                {pendingInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        invoice.status === 'overdue' 
                          ? 'bg-red-100' 
                          : 'bg-amber-100'
                      }`}>
                        <FileText className={`h-4 w-4 ${
                          invoice.status === 'overdue' ? 'text-red-600' : 'text-amber-600'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {invoice.invoice_number}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {invoice.member?.first_name} {invoice.member?.last_name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold">
                        {formatCurrency(invoice.total_amount - invoice.amount_paid, invoice.currency)}
                      </span>
                      <p className={`text-xs ${
                        invoice.status === 'overdue' ? 'text-red-600' : 'text-amber-600'
                      }`}>
                        {invoice.status === 'overdue' ? 'En retard' : 'En attente'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinanceDashboard;
