
-- Create storage bucket for member documents and photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('member-documents', 'member-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for member documents
CREATE POLICY "Authenticated users can upload member documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'member-documents');

CREATE POLICY "Authenticated users can view member documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'member-documents');

CREATE POLICY "Authenticated users can update their uploaded documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'member-documents');

CREATE POLICY "Authenticated users can delete their uploaded documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'member-documents');

-- Create members table for all organization types
CREATE TABLE public.members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Common fields
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  photo_url TEXT,
  badge_number TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
  notes TEXT,
  
  -- School specific fields
  student_id TEXT,
  grade_level TEXT,
  enrollment_date DATE,
  graduation_date DATE,
  parent_name TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  
  -- Church specific fields
  member_since DATE,
  baptism_date DATE,
  conversion_date DATE,
  marriage_date DATE,
  presentation_date DATE,
  death_date DATE,
  member_role TEXT,
  reference_person TEXT,
  responsible_person TEXT,
  groups TEXT[], -- Array of group names (chorale, security, etc.)
  
  -- Organization specific fields
  membership_type TEXT,
  membership_start DATE,
  membership_end DATE,
  contribution_amount DECIMAL(10, 2),
  contribution_frequency TEXT CHECK (contribution_frequency IN ('weekly', 'monthly', 'yearly')),
  last_contribution_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create member documents table
CREATE TABLE public.member_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- birth_certificate, vaccination_card, transcript, id_card, etc.
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for members
CREATE POLICY "Organization members can view members"
ON public.members
FOR SELECT
USING (public.is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Organization admins can insert members"
ON public.members
FOR INSERT
WITH CHECK (public.is_organization_admin(auth.uid(), organization_id));

CREATE POLICY "Organization admins can update members"
ON public.members
FOR UPDATE
USING (public.is_organization_admin(auth.uid(), organization_id));

CREATE POLICY "Organization admins can delete members"
ON public.members
FOR DELETE
USING (public.is_organization_admin(auth.uid(), organization_id));

-- RLS Policies for member_documents
CREATE POLICY "Organization members can view documents"
ON public.member_documents
FOR SELECT
USING (public.is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Organization admins can insert documents"
ON public.member_documents
FOR INSERT
WITH CHECK (public.is_organization_admin(auth.uid(), organization_id));

CREATE POLICY "Organization admins can update documents"
ON public.member_documents
FOR UPDATE
USING (public.is_organization_admin(auth.uid(), organization_id));

CREATE POLICY "Organization admins can delete documents"
ON public.member_documents
FOR DELETE
USING (public.is_organization_admin(auth.uid(), organization_id));

-- Create indexes for better performance
CREATE INDEX idx_members_organization_id ON public.members(organization_id);
CREATE INDEX idx_members_status ON public.members(status);
CREATE INDEX idx_member_documents_member_id ON public.member_documents(member_id);

-- Trigger to update updated_at
CREATE TRIGGER update_members_updated_at
BEFORE UPDATE ON public.members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
