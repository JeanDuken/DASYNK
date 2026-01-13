import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useFinanceCategories, useCreateTransaction, useUpdateTransaction, FinanceTransaction } from '@/hooks/useFinance';
import { useMembers } from '@/hooks/useMembers';
import { currencies } from '@/lib/currencies';

interface TransactionFormProps {
  organizationId: string;
  currency: string;
  category: 'school' | 'church' | 'organization';
  transaction?: FinanceTransaction | null;
  onBack: () => void;
}

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.string().min(1, 'Le montant est requis'),
  currency: z.string().min(1, 'La devise est requise'),
  category_id: z.string().optional(),
  member_id: z.string().optional(),
  description: z.string().optional(),
  reference_number: z.string().optional(),
  payment_method: z.string().optional(),
  payment_status: z.enum(['pending', 'completed', 'failed', 'refunded', 'cancelled']),
  transaction_date: z.string().min(1, 'La date est requise'),
  due_date: z.string().optional(),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

const TransactionForm: React.FC<TransactionFormProps> = ({
  organizationId,
  currency,
  category,
  transaction,
  onBack,
}) => {
  const { t } = useTranslation();
  const { data: categories } = useFinanceCategories(organizationId);
  const { data: members } = useMembers(organizationId);
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.type || 'income',
      amount: transaction?.amount?.toString() || '',
      currency: transaction?.currency || currency,
      category_id: transaction?.category_id || '',
      member_id: transaction?.member_id || '',
      description: transaction?.description || '',
      reference_number: transaction?.reference_number || '',
      payment_method: transaction?.payment_method || 'cash',
      payment_status: transaction?.payment_status || 'completed',
      transaction_date: transaction?.transaction_date || new Date().toISOString().split('T')[0],
      due_date: transaction?.due_date || '',
      notes: transaction?.notes || '',
    },
  });

  const transactionType = form.watch('type');

  const filteredCategories = categories?.filter(c => c.type === transactionType) || [];

  const getCategoryTypeOptions = () => {
    if (category === 'church') {
      return transactionType === 'income'
        ? [
            { value: 'tithe', label: 'Dîme' },
            { value: 'offering', label: 'Offrande' },
            { value: 'special_collection', label: 'Collecte Spéciale' },
            { value: 'donation', label: 'Don' },
            { value: 'event', label: 'Événement' },
          ]
        : [
            { value: 'utilities', label: 'Services Publics' },
            { value: 'salaries', label: 'Salaires' },
            { value: 'maintenance', label: 'Entretien' },
            { value: 'supplies', label: 'Fournitures' },
            { value: 'events', label: 'Événements' },
          ];
    } else if (category === 'school') {
      return transactionType === 'income'
        ? [
            { value: 'tuition', label: 'Frais Scolaires' },
            { value: 'registration', label: 'Inscription' },
            { value: 'cafeteria', label: 'Cantine' },
            { value: 'materials', label: 'Matériels' },
            { value: 'activities', label: 'Activités' },
          ]
        : [
            { value: 'salaries', label: 'Salaires' },
            { value: 'utilities', label: 'Services Publics' },
            { value: 'supplies', label: 'Fournitures' },
            { value: 'maintenance', label: 'Entretien' },
            { value: 'equipment', label: 'Équipements' },
          ];
    } else {
      return transactionType === 'income'
        ? [
            { value: 'donation', label: 'Don' },
            { value: 'grant', label: 'Subvention' },
            { value: 'sponsorship', label: 'Parrainage' },
            { value: 'membership', label: 'Cotisation' },
            { value: 'project', label: 'Projet' },
          ]
        : [
            { value: 'operations', label: 'Opérations' },
            { value: 'salaries', label: 'Salaires' },
            { value: 'supplies', label: 'Fournitures' },
            { value: 'travel', label: 'Déplacements' },
            { value: 'project', label: 'Projet' },
          ];
    }
  };

  const onSubmit = (data: TransactionFormData) => {
    const transactionData = {
      organization_id: organizationId,
      type: data.type,
      amount: parseFloat(data.amount),
      currency: data.currency,
      category_id: data.category_id || null,
      member_id: data.member_id || null,
      description: data.description || null,
      reference_number: data.reference_number || null,
      payment_method: data.payment_method || null,
      payment_status: data.payment_status,
      transaction_date: data.transaction_date,
      due_date: data.due_date || null,
      notes: data.notes || null,
    };

    if (transaction) {
      updateTransaction.mutate(
        { id: transaction.id, ...transactionData },
        { onSuccess: onBack }
      );
    } else {
      createTransaction.mutate(transactionData, { onSuccess: onBack });
    }
  };

  const getMemberLabel = () => {
    switch (category) {
      case 'church':
        return 'Membre';
      case 'school':
        return 'Élève';
      default:
        return 'Membre';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>
            {transaction ? 'Modifier la Transaction' : 'Nouvelle Transaction'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de Transaction *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="income">Revenu</SelectItem>
                        <SelectItem value="expense">Dépense</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Currency */}
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Devise *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner la devise" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {currencies.map((cur) => (
                          <SelectItem key={cur.code} value={cur.code}>
                            {cur.symbol} - {cur.name} ({cur.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Transaction Date */}
              <FormField
                control={form.control}
                name="transaction_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de Transaction *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment Method */}
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Méthode de Paiement</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner la méthode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Espèces</SelectItem>
                        <SelectItem value="card">Carte Bancaire</SelectItem>
                        <SelectItem value="bank_transfer">Virement Bancaire</SelectItem>
                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        <SelectItem value="check">Chèque</SelectItem>
                        <SelectItem value="online">Paiement en Ligne</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment Status */}
              <FormField
                control={form.control}
                name="payment_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="completed">Complété</SelectItem>
                        <SelectItem value="pending">En Attente</SelectItem>
                        <SelectItem value="failed">Échoué</SelectItem>
                        <SelectItem value="refunded">Remboursé</SelectItem>
                        <SelectItem value="cancelled">Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Member */}
              <FormField
                control={form.control}
                name="member_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{getMemberLabel()}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={`Sélectionner un ${getMemberLabel().toLowerCase()}`} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {members?.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.first_name} {member.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reference Number */}
              <FormField
                control={form.control}
                name="reference_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de Référence</FormLabel>
                    <FormControl>
                      <Input placeholder="REF-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Due Date */}
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date d'Échéance</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Description de la transaction" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notes additionnelles..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onBack}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createTransaction.isPending || updateTransaction.isPending}
              >
                {createTransaction.isPending || updateTransaction.isPending
                  ? 'Enregistrement...'
                  : transaction
                  ? 'Mettre à jour'
                  : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;
