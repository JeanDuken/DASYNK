import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Member {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  date_of_birth: string | null;
  gender: string | null;
  photo_url: string | null;
  badge_number: string | null;
  status: string;
  notes: string | null;
  // School fields
  student_id: string | null;
  grade_level: string | null;
  enrollment_date: string | null;
  graduation_date: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  parent_email: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  // Church fields
  member_since: string | null;
  baptism_date: string | null;
  conversion_date: string | null;
  marriage_date: string | null;
  presentation_date: string | null;
  death_date: string | null;
  member_role: string | null;
  reference_person: string | null;
  responsible_person: string | null;
  groups: string[] | null;
  // Organization fields
  membership_type: string | null;
  membership_start: string | null;
  membership_end: string | null;
  contribution_amount: number | null;
  contribution_frequency: string | null;
  last_contribution_date: string | null;
  created_at: string;
  updated_at: string;
}

export type MemberInsert = Omit<Member, 'id' | 'created_at' | 'updated_at'>;

export const useMembers = (organizationId: string | undefined) => {
  return useQuery({
    queryKey: ['members', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Member[];
    },
    enabled: !!organizationId,
  });
};

export const useCreateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (member: MemberInsert) => {
      const { data, error } = await supabase
        .from('members')
        .insert(member)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members', variables.organization_id] });
      toast.success('Membre ajouté avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Member> & { id: string }) => {
      const { data, error } = await supabase
        .from('members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['members', data.organization_id] });
      toast.success('Membre mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, organizationId }: { id: string; organizationId: string }) => {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, organizationId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['members', data.organizationId] });
      toast.success('Membre supprimé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};
