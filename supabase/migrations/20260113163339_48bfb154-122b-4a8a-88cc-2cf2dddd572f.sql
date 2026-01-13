-- Fix RLS policies - change from RESTRICTIVE to PERMISSIVE

-- Drop existing organization_members INSERT policy and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Users can add themselves as owner" ON public.organization_members;

CREATE POLICY "Users can add themselves as owner" 
ON public.organization_members 
AS PERMISSIVE
FOR INSERT 
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  AND role = 'owner' 
  AND EXISTS (
    SELECT 1 FROM organizations 
    WHERE organizations.id = organization_members.organization_id 
    AND organizations.owner_id = auth.uid()
  )
);

-- Drop existing organizations INSERT policy and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;

CREATE POLICY "Users can create organizations" 
ON public.organizations 
AS PERMISSIVE
FOR INSERT 
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Also fix the SELECT policy on organizations to allow owners to see their org
DROP POLICY IF EXISTS "Users can view organizations they are members of" ON public.organizations;

CREATE POLICY "Users can view organizations they are members of" 
ON public.organizations 
AS PERMISSIVE
FOR SELECT 
TO authenticated
USING (
  owner_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM organization_members 
    WHERE organization_members.organization_id = organizations.id 
    AND organization_members.user_id = auth.uid()
  )
);

-- Fix UPDATE policy to be permissive
DROP POLICY IF EXISTS "Owners can update their organizations" ON public.organizations;

CREATE POLICY "Owners can update their organizations" 
ON public.organizations 
AS PERMISSIVE
FOR UPDATE 
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Fix DELETE policy to be permissive
DROP POLICY IF EXISTS "Owners can delete their organizations" ON public.organizations;

CREATE POLICY "Owners can delete their organizations" 
ON public.organizations 
AS PERMISSIVE
FOR DELETE 
TO authenticated
USING (owner_id = auth.uid());

-- Fix organization_members policies to be permissive
DROP POLICY IF EXISTS "Members can view organization members" ON public.organization_members;

CREATE POLICY "Members can view organization members" 
ON public.organization_members 
AS PERMISSIVE
FOR SELECT 
TO authenticated
USING (is_organization_member(auth.uid(), organization_id));

DROP POLICY IF EXISTS "Admins can manage organization members" ON public.organization_members;

CREATE POLICY "Admins can manage organization members" 
ON public.organization_members 
AS PERMISSIVE
FOR ALL 
TO authenticated
USING (is_organization_admin(auth.uid(), organization_id))
WITH CHECK (is_organization_admin(auth.uid(), organization_id));