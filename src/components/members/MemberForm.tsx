import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Member, MemberInsert } from '@/hooks/useMembers';

const baseSchema = z.object({
  first_name: z.string().min(1, 'Prénom requis'),
  last_name: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  badge_number: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']),
  notes: z.string().optional(),
});

const schoolSchema = baseSchema.extend({
  student_id: z.string().optional(),
  grade_level: z.string().optional(),
  enrollment_date: z.string().optional(),
  graduation_date: z.string().optional(),
  parent_name: z.string().optional(),
  parent_phone: z.string().optional(),
  parent_email: z.string().email('Email invalide').optional().or(z.literal('')),
  emergency_contact: z.string().optional(),
  emergency_phone: z.string().optional(),
});

const churchSchema = baseSchema.extend({
  member_since: z.string().optional(),
  baptism_date: z.string().optional(),
  conversion_date: z.string().optional(),
  marriage_date: z.string().optional(),
  presentation_date: z.string().optional(),
  member_role: z.string().optional(),
  reference_person: z.string().optional(),
  responsible_person: z.string().optional(),
  groups: z.array(z.string()).optional(),
});

const organizationSchema = baseSchema.extend({
  membership_type: z.string().optional(),
  membership_start: z.string().optional(),
  membership_end: z.string().optional(),
  contribution_amount: z.number().optional(),
  contribution_frequency: z.enum(['weekly', 'monthly', 'yearly']).optional(),
});

interface MemberFormProps {
  category: 'school' | 'church' | 'organization';
  member?: Member | null;
  onSubmit: (data: Partial<MemberInsert>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const MemberForm = ({ category, member, onSubmit, onCancel, isLoading }: MemberFormProps) => {
  const { t } = useTranslation();

  const schema = category === 'school' ? schoolSchema : category === 'church' ? churchSchema : organizationSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: member?.first_name || '',
      last_name: member?.last_name || '',
      email: member?.email || '',
      phone: member?.phone || '',
      address: member?.address || '',
      city: member?.city || '',
      date_of_birth: member?.date_of_birth || '',
      gender: (member?.gender as 'male' | 'female' | 'other') || undefined,
      badge_number: member?.badge_number || '',
      status: (member?.status as 'active' | 'inactive' | 'suspended' | 'pending') || 'active',
      notes: member?.notes || '',
      // School fields
      student_id: member?.student_id || '',
      grade_level: member?.grade_level || '',
      enrollment_date: member?.enrollment_date || '',
      graduation_date: member?.graduation_date || '',
      parent_name: member?.parent_name || '',
      parent_phone: member?.parent_phone || '',
      parent_email: member?.parent_email || '',
      emergency_contact: member?.emergency_contact || '',
      emergency_phone: member?.emergency_phone || '',
      // Church fields
      member_since: member?.member_since || '',
      baptism_date: member?.baptism_date || '',
      conversion_date: member?.conversion_date || '',
      marriage_date: member?.marriage_date || '',
      presentation_date: member?.presentation_date || '',
      member_role: member?.member_role || '',
      reference_person: member?.reference_person || '',
      responsible_person: member?.responsible_person || '',
      groups: member?.groups || [],
      // Organization fields
      membership_type: member?.membership_type || '',
      membership_start: member?.membership_start || '',
      membership_end: member?.membership_end || '',
      contribution_amount: member?.contribution_amount || undefined,
      contribution_frequency: member?.contribution_frequency as 'weekly' | 'monthly' | 'yearly' | undefined,
    },
  });

  const handleSubmit = (data: any) => {
    // Clean empty strings to null
    const cleaned = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, value === '' ? null : value])
    );
    onSubmit(cleaned);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Informations personnelles</TabsTrigger>
            <TabsTrigger value="specific">
              {category === 'school' ? 'Scolarité' : category === 'church' ? 'Église' : 'Adhésion'}
            </TabsTrigger>
            <TabsTrigger value="contact">Contact & Urgence</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de naissance</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover">
                        <SelectItem value="male">Masculin</SelectItem>
                        <SelectItem value="female">Féminin</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="badge_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de badge</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover">
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                        <SelectItem value="suspended">Suspendu</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="specific" className="space-y-4 mt-4">
            {category === 'school' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="student_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Matricule</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="grade_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classe / Niveau</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="enrollment_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date d'inscription</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="graduation_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de graduation prévue</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {category === 'church' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="member_since"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membre depuis</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="member_role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rôle dans l'église</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Diacre, Pasteur..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="baptism_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de baptême</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="conversion_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de conversion</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="marriage_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de mariage</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="presentation_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Présentation au temple</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reference_person"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personne de référence</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="responsible_person"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personne responsable</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {category === 'organization' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="membership_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type d'adhésion</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Standard, Premium..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contribution_frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fréquence de cotisation</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover">
                          <SelectItem value="weekly">Hebdomadaire</SelectItem>
                          <SelectItem value="monthly">Mensuelle</SelectItem>
                          <SelectItem value="yearly">Annuelle</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contribution_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant de cotisation</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="membership_start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Début d'adhésion</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="membership_end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fin d'adhésion</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="contact" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Adresse</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {category === 'school' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Parent / Tuteur</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="parent_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du parent</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="parent_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="parent_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact d'urgence</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="emergency_contact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="emergency_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Enregistrement...' : member ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MemberForm;
