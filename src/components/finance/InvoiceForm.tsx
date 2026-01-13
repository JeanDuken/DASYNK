import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useCreateInvoice, useUpdateInvoice, Invoice } from '@/hooks/useFinance';
import { useMembers } from '@/hooks/useMembers';
import { currencies, formatCurrency } from '@/lib/currencies';

interface InvoiceFormProps {
  organizationId: string;
  currency: string;
  category: 'school' | 'church' | 'organization';
  invoice?: Invoice | null;
  onBack: () => void;
}

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'La description est requise'),
  quantity: z.string().min(1, 'La quantité est requise'),
  unit_price: z.string().min(1, 'Le prix unitaire est requis'),
});

const invoiceSchema = z.object({
  member_id: z.string().optional(),
  invoice_number: z.string().min(1, 'Le numéro de facture est requis'),
  status: z.enum(['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled']),
  currency: z.string().min(1, 'La devise est requise'),
  issue_date: z.string().min(1, 'La date d\'émission est requise'),
  due_date: z.string().optional(),
  tax_amount: z.string().optional(),
  discount_amount: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'Au moins un article est requis'),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  organizationId,
  currency,
  category,
  invoice,
  onBack,
}) => {
  const { t } = useTranslation();
  const { data: members } = useMembers(organizationId);
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();

  const generateInvoiceNumber = () => {
    const prefix = category === 'school' ? 'SCH' : category === 'church' ? 'CHU' : 'ORG';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${year}${month}-${random}`;
  };

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      member_id: invoice?.member_id || '',
      invoice_number: invoice?.invoice_number || generateInvoiceNumber(),
      status: invoice?.status || 'draft',
      currency: invoice?.currency || currency,
      issue_date: invoice?.issue_date || new Date().toISOString().split('T')[0],
      due_date: invoice?.due_date || '',
      tax_amount: invoice?.tax_amount?.toString() || '0',
      discount_amount: invoice?.discount_amount?.toString() || '0',
      notes: invoice?.notes || '',
      terms: invoice?.terms || '',
      items: invoice?.items?.map(item => ({
        description: item.description,
        quantity: item.quantity.toString(),
        unit_price: item.unit_price.toString(),
      })) || [{ description: '', quantity: '1', unit_price: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const watchItems = form.watch('items');
  const watchTax = form.watch('tax_amount');
  const watchDiscount = form.watch('discount_amount');
  const watchCurrency = form.watch('currency');

  const subtotal = watchItems.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unit_price) || 0;
    return sum + (qty * price);
  }, 0);

  const taxAmount = parseFloat(watchTax || '0') || 0;
  const discountAmount = parseFloat(watchDiscount || '0') || 0;
  const total = subtotal + taxAmount - discountAmount;

  const onSubmit = (data: InvoiceFormData) => {
    const invoiceData = {
      organization_id: organizationId,
      member_id: data.member_id || null,
      invoice_number: data.invoice_number,
      status: data.status,
      subtotal,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      total_amount: total,
      amount_paid: invoice?.amount_paid || 0,
      currency: data.currency,
      issue_date: data.issue_date,
      due_date: data.due_date || null,
      notes: data.notes || null,
      terms: data.terms || null,
      items: data.items.map(item => ({
        description: item.description,
        quantity: parseInt(item.quantity),
        unit_price: parseFloat(item.unit_price),
        amount: parseInt(item.quantity) * parseFloat(item.unit_price),
      })),
    };

    if (invoice) {
      const { items, ...updateData } = invoiceData;
      updateInvoice.mutate(
        { id: invoice.id, ...updateData },
        { onSuccess: onBack }
      );
    } else {
      createInvoice.mutate(invoiceData, { onSuccess: onBack });
    }
  };

  const getMemberLabel = () => {
    switch (category) {
      case 'church':
        return 'Membre';
      case 'school':
        return 'Élève / Parent';
      default:
        return 'Client';
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
            {invoice ? 'Modifier la Facture' : 'Nouvelle Facture'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="invoice_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de Facture *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Brouillon</SelectItem>
                        <SelectItem value="sent">Envoyée</SelectItem>
                        <SelectItem value="paid">Payée</SelectItem>
                        <SelectItem value="partial">Partiel</SelectItem>
                        <SelectItem value="overdue">En retard</SelectItem>
                        <SelectItem value="cancelled">Annulée</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <FormField
                control={form.control}
                name="issue_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date d'Émission *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

            <Separator />

            {/* Invoice Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Articles</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ description: '', quantity: '1', unit_price: '' })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => {
                  const qty = parseFloat(watchItems[index]?.quantity) || 0;
                  const price = parseFloat(watchItems[index]?.unit_price) || 0;
                  const itemTotal = qty * price;

                  return (
                    <div key={field.id} className="grid gap-4 sm:grid-cols-12 items-start">
                      <div className="sm:col-span-5">
                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              {index === 0 && <FormLabel>Description</FormLabel>}
                              <FormControl>
                                <Input placeholder="Description de l'article" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              {index === 0 && <FormLabel>Qté</FormLabel>}
                              <FormControl>
                                <Input type="number" min="1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.unit_price`}
                          render={({ field }) => (
                            <FormItem>
                              {index === 0 && <FormLabel>Prix Unit.</FormLabel>}
                              <FormControl>
                                <Input type="number" step="0.01" min="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        {index === 0 && <FormLabel className="invisible">Total</FormLabel>}
                        <div className="h-10 flex items-center font-medium">
                          {formatCurrency(itemTotal, watchCurrency)}
                        </div>
                      </div>

                      <div className="sm:col-span-1">
                        {index === 0 && <FormLabel className="invisible">Action</FormLabel>}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="h-10"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Totals */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="Notes pour le client..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conditions</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="Conditions de paiement..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="font-medium">{formatCurrency(subtotal, watchCurrency)}</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Taxes</span>
                  <FormField
                    control={form.control}
                    name="tax_amount"
                    render={({ field }) => (
                      <FormItem className="w-32">
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Remise</span>
                  <FormField
                    control={form.control}
                    name="discount_amount"
                    render={({ field }) => (
                      <FormItem className="w-32">
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold">{formatCurrency(total, watchCurrency)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onBack}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createInvoice.isPending || updateInvoice.isPending}
              >
                {createInvoice.isPending || updateInvoice.isPending
                  ? 'Enregistrement...'
                  : invoice
                  ? 'Mettre à jour'
                  : 'Créer la Facture'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default InvoiceForm;
