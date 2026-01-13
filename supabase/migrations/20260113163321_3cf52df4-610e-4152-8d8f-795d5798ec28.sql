-- Fix RLS policies for organization creation flow

-- First, drop the existing restrictive INSERT policy on organization_members
DROP POLICY IF EXISTS "Users can add themselves as owner" ON public.organization_members;

-- Create a new permissive INSERT policy that allows users to add themselves as owner
-- This checks that the user is adding themselves and the organization's owner_id matches
CREATE POLICY "Users can add themselves as owner" 
ON public.organization_members 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() 
  AND role = 'owner' 
  AND EXISTS (
    SELECT 1 FROM organizations 
    WHERE organizations.id = organization_members.organization_id 
    AND organizations.owner_id = auth.uid()
  )
);

-- Also make sure the organizations INSERT policy is permissive (not restrictive)
-- Drop and recreate the INSERT policy as permissive
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;

CREATE POLICY "Users can create organizations" 
ON public.organizations 
FOR INSERT 
WITH CHECK (owner_id = auth.uid());