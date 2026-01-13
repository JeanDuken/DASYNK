import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';
import { useToast } from '@/hooks/use-toast';

export interface Visitor {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  visit_date: string;
  how_heard: string | null;
  prayer_request: string | null;
  follow_up_status: string | null;
  follow_up_notes: string | null;
  assigned_to: string | null;
  converted_to_member: boolean | null;
  member_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface VisitorInsert {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  visit_date?: string;
  how_heard?: string;
  prayer_request?: string;
  follow_up_status?: string;
  assigned_to?: string;
}

export const useVisitors = () => {
  const { organization } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: visitors = [], isLoading, error } = useQuery({
    queryKey: ['visitors', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .eq('organization_id', organization.id)
        .order('visit_date', { ascending: false });

      if (error) throw error;
      return data as Visitor[];
    },
    enabled: !!organization?.id,
  });

  const createVisitor = useMutation({
    mutationFn: async (visitor: VisitorInsert) => {
      if (!organization?.id) throw new Error('No organization');
      
      const { data, error } = await supabase
        .from('visitors')
        .insert({ ...visitor, organization_id: organization.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      toast({ title: 'Visiteur ajouté avec succès' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const updateVisitor = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Visitor> & { id: string }) => {
      const { data, error } = await supabase
        .from('visitors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      toast({ title: 'Visiteur modifié avec succès' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const deleteVisitor = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('visitors').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      toast({ title: 'Visiteur supprimé' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const convertToMember = useMutation({
    mutationFn: async (visitorId: string) => {
      const visitor = visitors.find(v => v.id === visitorId);
      if (!visitor || !organization?.id) throw new Error('Visitor not found');

      // Create member from visitor
      const { data: member, error: memberError } = await supabase
        .from('members')
        .insert({
          organization_id: organization.id,
          first_name: visitor.first_name,
          last_name: visitor.last_name,
          email: visitor.email,
          phone: visitor.phone,
          address: visitor.address,
          city: visitor.city,
          member_since: new Date().toISOString().split('T')[0],
          status: 'active',
        })
        .select()
        .single();

      if (memberError) throw memberError;

      // Update visitor
      const { error: updateError } = await supabase
        .from('visitors')
        .update({ converted_to_member: true, member_id: member.id })
        .eq('id', visitorId);

      if (updateError) throw updateError;
      return member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({ title: 'Visiteur converti en membre' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  return {
    visitors,
    isLoading,
    error,
    createVisitor,
    updateVisitor,
    deleteVisitor,
    convertToMember,
  };
};
