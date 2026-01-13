import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from 'lucide-react';
import { useFinanceTransactions, useDeleteTransaction, FinanceTransaction } from '@/hooks/useFinance';
import { formatCurrency } from '@/lib/currencies';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TransactionsListProps {
  organizationId: string;
  currency: string;
  onAddClick: () => void;
  onEditClick: (transaction: FinanceTransaction) => void;
}

const TransactionsList: React.FC<TransactionsListProps> = ({
  organizationId,
  currency,
  onAddClick,
  onEditClick,
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: transactions, isLoading } = useFinanceTransactions(organizationId, {
    type: typeFilter !== 'all' ? (typeFilter as 'income' | 'expense') : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });
  const deleteTransaction = useDeleteTransaction();

  const filteredTransactions = transactions?.filter((t) =>
    (t.description?.toLowerCase().includes(search.toLowerCase()) ||
     t.category?.name.toLowerCase().includes(search.toLowerCase()) ||
     t.reference_number?.toLowerCase().includes(search.toLowerCase()))
  ) || [];

  const handleDelete = () => {
    if (deleteId) {
      deleteTransaction.mutate({ id: deleteId, organizationId });
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      completed: { label: 'Complété', variant: 'default' },
      pending: { label: 'En attente', variant: 'secondary' },
      failed: { label: 'Échoué', variant: 'destructive' },
      refunded: { label: 'Remboursé', variant: 'outline' },
      cancelled: { label: 'Annulé', variant: 'outline' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentMethodLabel = (method: string | undefined) => {
    const methods: Record<string, string> = {
      cash: 'Espèces',
      card: 'Carte',
      bank_transfer: 'Virement',
      mobile_money: 'Mobile Money',
      check: 'Chèque',
      online: 'En ligne',
    };
    return methods[method || ''] || method || '-';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg">Transactions</CardTitle>
            <Button onClick={onAddClick} className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle Transaction
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="income">Revenus</SelectItem>
                <SelectItem value="expense">Dépenses</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="completed">Complété</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="failed">Échoué</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="spinner" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucune transaction trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {format(new Date(transaction.transaction_date), 'dd/MM/yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                            transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {transaction.type === 'income' ? (
                              <ArrowUpRight className="h-3 w-3 text-green-600" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 text-red-600" />
                            )}
                          </div>
                          <span>{transaction.description || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.category?.name || '-'}</TableCell>
                      <TableCell>{getPaymentMethodLabel(transaction.payment_method)}</TableCell>
                      <TableCell>{getStatusBadge(transaction.payment_status)}</TableCell>
                      <TableCell className={`text-right font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditClick(transaction)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteId(transaction.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la transaction ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La transaction sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TransactionsList;
