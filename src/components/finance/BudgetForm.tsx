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
import { useFinanceCategories, useCreateBudget, Budget } from '@/hooks/useFinance';
import { currencies } from '@/lib/currencies';

interface BudgetFormProps {
  organizationId: string;
  currency: string;
  budget?: Budget | null;
  onBack: () => void;
}

const budgetSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  type: z.enum(['income', 'expense']),
  category_id: z.string().optional(),
  planned_amount: z.string().min(1, 'Le montant prévu est requis'),
  actual_amount: z.string().optional(),
  currency: z.string().min(1, 'La devise est requise'),
  period_start: z.string().min(1, 'La date de début est requise'),
  period_end: z.string().min(1, 'La date de fin est requise'),
  fiscal_year: z.string().optional(),
  notes: z.string().optional(),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

const BudgetForm: React.FC<BudgetFormProps> = ({
  organizationId,
  currency,
  budget,
  onBack,
}) => {
  const { t } = useTranslation();
  const { data: categories } = useFinanceCategories(organizationId);
  const createBudget = useCreateBudget();

  const currentYear = new Date().getFullYear();

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: budget?.name || '',
      type: budget?.type || 'expense',
      category_id: budget?.category_id || '',
      planned_amount: budget?.planned_amount?.toString() || '',
      actual_amount: budget?.actual_amount?.toString() || '0',
      currency: budget?.currency || currency,
      period_start: budget?.period_start || `${currentYear}-01-01`,
      period_end: budget?.period_end || `${currentYear}-12-31`,
      fiscal_year: budget?.fiscal_year?.toString() || currentYear.toString(),
      notes: budget?.notes || '',
    },
  });

  const budgetType = form.watch('type');
  const filteredCategories = categories?.filter(c => c.type === budgetType) || [];

  const onSubmit = (data: BudgetFormData) => {
    const budgetData = {
      organization_id: organizationId,
      name: data.name,
      type: data.type,
      category_id: data.category_id || null,
      planned_amount: parseFloat(data.planned_amount),
      actual_amount: parseFloat(data.actual_amount || '0'),
      currency: data.currency,
      period_start: data.period_start,
      period_end: data.period_end,
      fiscal_year: data.fiscal_year ? parseInt(data.fiscal_year) : null,
      notes: data.notes || null,
    };

    createBudget.mutate(budgetData, { onSuccess: onBack });
  };

  const years = Array.from({ length: 5 }, (_, i) => currentYear + i - 2);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>
            {budget ? 'Modifier le Budget' : 'Nouveau Budget'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du Budget *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Salaires 2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
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

              {/* Fiscal Year */}
              <FormField
                control={form.control}
                name="fiscal_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Année Fiscale</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Planned Amount */}
              <FormField
                control={form.control}
                name="planned_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant Prévu *</FormLabel>
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
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {currencies.map((cur) => (
                          <SelectItem key={cur.code} value={cur.code}>
                            {cur.symbol} - {cur.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Period Start */}
              <FormField
                control={form.control}
                name="period_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de Début *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Period End */}
              <FormField
                control={form.control}
                name="period_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de Fin *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
              <Button type="submit" disabled={createBudget.isPending}>
                {createBudget.isPending
                  ? 'Enregistrement...'
                  : budget
                  ? 'Mettre à jour'
                  : 'Créer le Budget'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BudgetForm;
