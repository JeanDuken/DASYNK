import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';
import { useToast } from '@/hooks/use-toast';

export interface Media {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  type: string | null;
  url: string | null;
  thumbnail_url: string | null;
  duration: number | null;
  speaker: string | null;
  recorded_date: string | null;
  series: string | null;
  tags: string[] | null;
  views_count: number | null;
  is_published: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface MediaInsert {
  title: string;
  description?: string;
  type?: string;
  url?: string;
  thumbnail_url?: string;
  duration?: number;
  speaker?: string;
  recorded_date?: string;
  series?: string;
  tags?: string[];
  is_published?: boolean;
}

export const useMedia = () => {
  const { organization } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mediaList = [], isLoading, error } = useQuery({
    queryKey: ['media', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('organization_id', organization.id)
        .order('recorded_date', { ascending: false });

      if (error) throw error;
      return data as Media[];
    },
    enabled: !!organization?.id,
  });

  const createMedia = useMutation({
    mutationFn: async (media: MediaInsert) => {
      if (!organization?.id) throw new Error('No organization');
      
      const { data, error } = await supabase
        .from('media')
        .insert({ ...media, organization_id: organization.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast({ title: 'Média ajouté avec succès' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const updateMedia = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Media> & { id: string }) => {
      const { data, error } = await supabase
        .from('media')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast({ title: 'Média modifié avec succès' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMedia = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('media').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast({ title: 'Média supprimé' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  return {
    mediaList,
    isLoading,
    error,
    createMedia,
    updateMedia,
    deleteMedia,
  };
};
