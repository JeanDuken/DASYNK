-- Drop existing problematic policies
DROP POLICY IF EXISTS "Members can view organization members" ON public.organization_members;
DROP POLICY IF EXISTS "Admins can manage organization members" ON public.organization_members;

-- Create security definer function to check organization membership
CREATE OR REPLACE FUNCTION public.is_organization_member(_user_id uuid, _organization_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _organization_id
  )
$$;

-- Create security definer function to check if user is admin/owner of organization
CREATE OR REPLACE FUNCTION public.is_organization_admin(_user_id uuid, _organization_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _organization_id
      AND role IN ('owner', 'admin')
  )
$$;

-- Recreate policies using security definer functions
CREATE POLICY "Members can view organization members"
ON public.organization_members
FOR SELECT
USING (public.is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Admins can manage organization members"
ON public.organization_members
FOR ALL
USING (public.is_organization_admin(auth.uid(), organization_id));

-- Add policy to allow users to insert themselves as owner when creating organization
CREATE POLICY "Users can add themselves as owner"
ON public.organization_members
FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  AND role = 'owner'
  AND EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_id 
    AND owner_id = auth.uid()
  )
);