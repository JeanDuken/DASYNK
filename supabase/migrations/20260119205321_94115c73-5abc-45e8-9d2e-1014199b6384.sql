-- Create attendance table for tracking member/student attendance
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in_time TIME,
  check_out_time TIME,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused')),
  event_type TEXT DEFAULT 'regular', -- 'regular', 'service', 'class', 'event'
  event_id UUID, -- Optional reference to a specific event or service
  class_name TEXT, -- For school context
  note TEXT,
  recorded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_attendance_organization ON public.attendance(organization_id);
CREATE INDEX idx_attendance_member ON public.attendance(member_id);
CREATE INDEX idx_attendance_date ON public.attendance(attendance_date);
CREATE INDEX idx_attendance_org_date ON public.attendance(organization_id, attendance_date);

-- Enable Row Level Security
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view attendance in their organization"
ON public.attendance
FOR SELECT
USING (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Admins can manage attendance"
ON public.attendance
FOR ALL
USING (is_organization_admin(organization_id, auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_attendance_updated_at
BEFORE UPDATE ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();