import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';
import { useToast } from '@/hooks/use-toast';

export interface Group {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  type: string | null;
  leader_id: string | null;
  meeting_day: string | null;
  meeting_time: string | null;
  meeting_location: string | null;
  max_members: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
  leader?: { first_name: string; last_name: string } | null;
  member_count?: number;
}

export interface GroupInsert {
  name: string;
  description?: string;
  type?: string;
  leader_id?: string;
  meeting_day?: string;
  meeting_time?: string;
  meeting_location?: string;
  max_members?: number;
  is_active?: boolean;
}

export const useGroups = () => {
  const { organization } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groups = [], isLoading, error } = useQuery({
    queryKey: ['groups', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          leader:members!groups_leader_id_fkey(first_name, last_name),
          group_members(count)
        `)
        .eq('organization_id', organization.id)
        .order('name');

      if (error) throw error;
      
      return data.map(g => ({
        ...g,
        member_count: g.group_members?.[0]?.count || 0
      })) as Group[];
    },
    enabled: !!organization?.id,
  });

  const createGroup = useMutation({
    mutationFn: async (group: GroupInsert) => {
      if (!organization?.id) throw new Error('No organization');
      
      const { data, error } = await supabase
        .from('groups')
        .insert({ ...group, organization_id: organization.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({ title: 'Groupe créé avec succès' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const updateGroup = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Group> & { id: string }) => {
      const { data, error } = await supabase
        .from('groups')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({ title: 'Groupe modifié avec succès' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const deleteGroup = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('groups').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({ title: 'Groupe supprimé' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  return {
    groups,
    isLoading,
    error,
    createGroup,
    updateGroup,
    deleteGroup,
  };
};
