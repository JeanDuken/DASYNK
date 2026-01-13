import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';
import { useToast } from '@/hooks/use-toast';

export interface Service {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  service_type: string | null;
  day_of_week: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  is_recurring: boolean | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceInsert {
  name: string;
  description?: string;
  service_type?: string;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  is_recurring?: boolean;
  is_active?: boolean;
}

export interface ServiceAttendance {
  id: string;
  service_id: string;
  organization_id: string;
  service_date: string;
  total_attendees: number;
  men_count: number;
  women_count: number;
  children_count: number;
  visitors_count: number;
  offering_amount: number;
  notes: string | null;
  created_at: string;
}

export const useServices = () => {
  const { organization } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ['services', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('organization_id', organization.id)
        .order('name');

      if (error) throw error;
      return data as Service[];
    },
    enabled: !!organization?.id,
  });

  const createService = useMutation({
    mutationFn: async (service: ServiceInsert) => {
      if (!organization?.id) throw new Error('No organization');
      
      const { data, error } = await supabase
        .from('services')
        .insert({ ...service, organization_id: organization.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast({ title: 'Service créé avec succès' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const updateService = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Service> & { id: string }) => {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast({ title: 'Service modifié avec succès' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast({ title: 'Service supprimé' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const recordAttendance = useMutation({
    mutationFn: async (attendance: Omit<ServiceAttendance, 'id' | 'created_at' | 'organization_id'>) => {
      if (!organization?.id) throw new Error('No organization');
      
      const { data, error } = await supabase
        .from('service_attendance')
        .insert({ ...attendance, organization_id: organization.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service_attendance'] });
      toast({ title: 'Présence enregistrée' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  return {
    services,
    isLoading,
    error,
    createService,
    updateService,
    deleteService,
    recordAttendance,
  };
};
