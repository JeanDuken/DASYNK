import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';
import { useToast } from '@/hooks/use-toast';

export interface Event {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  event_type: string | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
  max_attendees: number | null;
  registration_required: boolean | null;
  registration_deadline: string | null;
  status: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  registration_count?: number;
}

export interface EventInsert {
  title: string;
  description?: string;
  event_type?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  max_attendees?: number;
  registration_required?: boolean;
  registration_deadline?: string;
  status?: string;
}

export const useEvents = () => {
  const { organization } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['events', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_registrations(count)
        `)
        .eq('organization_id', organization.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      
      return data.map(e => ({
        ...e,
        registration_count: e.event_registrations?.[0]?.count || 0
      })) as Event[];
    },
    enabled: !!organization?.id,
  });

  const createEvent = useMutation({
    mutationFn: async (event: EventInsert) => {
      if (!organization?.id) throw new Error('No organization');
      
      const { data, error } = await supabase
        .from('events')
        .insert({ ...event, organization_id: organization.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Événement créé avec succès' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Event> & { id: string }) => {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Événement modifié avec succès' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Événement supprimé' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  return {
    events,
    isLoading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};
