import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';
import { useToast } from '@/hooks/use-toast';

export interface Discipleship {
  id: string;
  organization_id: string;
  member_id: string;
  mentor_id: string | null;
  program_name: string;
  start_date: string;
  expected_end_date: string | null;
  actual_end_date: string | null;
  status: string | null;
  current_step: number | null;
  total_steps: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  member?: { first_name: string; last_name: string } | null;
  mentor?: { first_name: string; last_name: string } | null;
}

export interface DiscipleshipInsert {
  member_id: string;
  mentor_id?: string;
  program_name: string;
  start_date?: string;
  expected_end_date?: string;
  total_steps?: number;
  notes?: string;
}

export const useDiscipleship = () => {
  const { organization } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: discipleships = [], isLoading, error } = useQuery({
    queryKey: ['discipleship', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from('discipleship')
        .select(`
          *,
          member:members!discipleship_member_id_fkey(first_name, last_name),
          mentor:members!discipleship_mentor_id_fkey(first_name, last_name)
        `)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Discipleship[];
    },
    enabled: !!organization?.id,
  });

  const createDiscipleship = useMutation({
    mutationFn: async (disc: DiscipleshipInsert) => {
      if (!organization?.id) throw new Error('No organization');
      
      const { data, error } = await supabase
        .from('discipleship')
        .insert({ ...disc, organization_id: organization.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discipleship'] });
      toast({ title: 'Parcours de discipulat créé' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const updateDiscipleship = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Discipleship> & { id: string }) => {
      const { data, error } = await supabase
        .from('discipleship')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discipleship'] });
      toast({ title: 'Parcours modifié' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const deleteDiscipleship = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('discipleship').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discipleship'] });
      toast({ title: 'Parcours supprimé' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const advanceStep = useMutation({
    mutationFn: async (id: string) => {
      const disc = discipleships.find(d => d.id === id);
      if (!disc) throw new Error('Not found');
      
      const newStep = (disc.current_step || 1) + 1;
      const isComplete = newStep > (disc.total_steps || 10);
      
      const { data, error } = await supabase
        .from('discipleship')
        .update({ 
          current_step: isComplete ? disc.total_steps : newStep,
          status: isComplete ? 'completed' : 'in_progress',
          actual_end_date: isComplete ? new Date().toISOString().split('T')[0] : null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discipleship'] });
      toast({ title: 'Étape validée' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  return {
    discipleships,
    isLoading,
    error,
    createDiscipleship,
    updateDiscipleship,
    deleteDiscipleship,
    advanceStep,
  };
};
