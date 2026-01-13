import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';
import { useToast } from '@/hooks/use-toast';

export interface Communication {
  id: string;
  organization_id: string;
  title: string;
  content: string;
  type: string | null;
  channel: string | null;
  status: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  recipient_count: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommunicationInsert {
  title: string;
  content: string;
  type?: string;
  channel?: string;
  status?: string;
  scheduled_at?: string;
}

export const useCommunications = () => {
  const { organization } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: communications = [], isLoading, error } = useQuery({
    queryKey: ['communications', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from('communications')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Communication[];
    },
    enabled: !!organization?.id,
  });

  const createCommunication = useMutation({
    mutationFn: async (comm: CommunicationInsert) => {
      if (!organization?.id) throw new Error('No organization');
      
      const { data, error } = await supabase
        .from('communications')
        .insert({ ...comm, organization_id: organization.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      toast({ title: 'Communication créée avec succès' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const updateCommunication = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Communication> & { id: string }) => {
      const { data, error } = await supabase
        .from('communications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      toast({ title: 'Communication modifiée' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const deleteCommunication = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('communications').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      toast({ title: 'Communication supprimée' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const sendCommunication = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('communications')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      toast({ title: 'Communication envoyée' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  return {
    communications,
    isLoading,
    error,
    createCommunication,
    updateCommunication,
    deleteCommunication,
    sendCommunication,
  };
};
