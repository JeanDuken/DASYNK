import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Attendance {
  id: string;
  organization_id: string;
  member_id: string;
  attendance_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: 'present' | 'absent' | 'late' | 'excused';
  event_type: string | null;
  event_id: string | null;
  class_name: string | null;
  note: string | null;
  recorded_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined member data
  member?: {
    id: string;
    first_name: string;
    last_name: string;
    photo_url: string | null;
    grade_level: string | null;
  };
}

export type AttendanceInsert = {
  organization_id: string;
  member_id: string;
  attendance_date?: string;
  check_in_time?: string | null;
  check_out_time?: string | null;
  status: 'present' | 'absent' | 'late' | 'excused';
  event_type?: string | null;
  event_id?: string | null;
  class_name?: string | null;
  note?: string | null;
  recorded_by?: string | null;
};

export const useAttendance = (organizationId: string | undefined, date?: string) => {
  return useQuery({
    queryKey: ['attendance', organizationId, date],
    queryFn: async () => {
      if (!organizationId) return [];
      
      let query = supabase
        .from('attendance')
        .select(`
          *,
          member:members(id, first_name, last_name, photo_url, grade_level)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (date) {
        query = query.eq('attendance_date', date);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Attendance[];
    },
    enabled: !!organizationId,
  });
};

export const useAttendanceStats = (organizationId: string | undefined, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['attendance-stats', organizationId, startDate, endDate],
    queryFn: async () => {
      if (!organizationId) return null;
      
      let query = supabase
        .from('attendance')
        .select('status')
        .eq('organization_id', organizationId);

      if (startDate) {
        query = query.gte('attendance_date', startDate);
      }
      if (endDate) {
        query = query.lte('attendance_date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats = {
        total: data.length,
        present: data.filter(a => a.status === 'present').length,
        absent: data.filter(a => a.status === 'absent').length,
        late: data.filter(a => a.status === 'late').length,
        excused: data.filter(a => a.status === 'excused').length,
      };

      return stats;
    },
    enabled: !!organizationId,
  });
};

export const useCreateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attendance: AttendanceInsert) => {
      const { data, error } = await supabase
        .from('attendance')
        .insert(attendance)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', variables.organization_id] });
      queryClient.invalidateQueries({ queryKey: ['attendance-stats', variables.organization_id] });
      toast.success('Présence enregistrée');
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Attendance> & { id: string }) => {
      const { data, error } = await supabase
        .from('attendance')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ['attendance-stats', data.organization_id] });
      toast.success('Présence mise à jour');
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

export const useBulkCreateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attendanceRecords: AttendanceInsert[]) => {
      const { data, error } = await supabase
        .from('attendance')
        .insert(attendanceRecords)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      if (variables.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['attendance', variables[0].organization_id] });
        queryClient.invalidateQueries({ queryKey: ['attendance-stats', variables[0].organization_id] });
      }
      toast.success(`${variables.length} présences enregistrées`);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, organizationId }: { id: string; organizationId: string }) => {
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, organizationId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', data.organizationId] });
      queryClient.invalidateQueries({ queryKey: ['attendance-stats', data.organizationId] });
      toast.success('Présence supprimée');
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};
