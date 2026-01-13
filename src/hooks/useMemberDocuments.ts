import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MemberDocument {
  id: string;
  member_id: string;
  organization_id: string;
  document_type: string;
  document_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_at: string;
}

export const useMemberDocuments = (memberId: string | undefined) => {
  return useQuery({
    queryKey: ['member-documents', memberId],
    queryFn: async () => {
      if (!memberId) return [];
      
      const { data, error } = await supabase
        .from('member_documents')
        .select('*')
        .eq('member_id', memberId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return data as MemberDocument[];
    },
    enabled: !!memberId,
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      memberId,
      organizationId,
      documentType,
    }: {
      file: File;
      memberId: string;
      organizationId: string;
      documentType: string;
    }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${organizationId}/${memberId}/${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('member-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('member-documents')
        .getPublicUrl(fileName);

      // Save document record
      const { data, error } = await supabase
        .from('member_documents')
        .insert({
          member_id: memberId,
          organization_id: organizationId,
          document_type: documentType,
          document_name: file.name,
          file_url: urlData.publicUrl,
          file_size: file.size,
          mime_type: file.type,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['member-documents', data.member_id] });
      toast.success('Document téléchargé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, memberId, fileUrl }: { id: string; memberId: string; fileUrl: string }) => {
      // Extract file path from URL
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(pathParts.indexOf('member-documents') + 1).join('/');

      // Delete from storage
      await supabase.storage
        .from('member-documents')
        .remove([filePath]);

      // Delete record
      const { error } = await supabase
        .from('member_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { memberId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['member-documents', data.memberId] });
      toast.success('Document supprimé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

export const useUploadPhoto = () => {
  return useMutation({
    mutationFn: async ({
      file,
      memberId,
      organizationId,
    }: {
      file: File;
      memberId: string;
      organizationId: string;
    }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${organizationId}/${memberId}/photo.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('member-documents')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('member-documents')
        .getPublicUrl(fileName);

      // Update member photo_url
      const { error } = await supabase
        .from('members')
        .update({ photo_url: urlData.publicUrl })
        .eq('id', memberId);

      if (error) throw error;
      return urlData.publicUrl;
    },
    onSuccess: () => {
      toast.success('Photo téléchargée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};
