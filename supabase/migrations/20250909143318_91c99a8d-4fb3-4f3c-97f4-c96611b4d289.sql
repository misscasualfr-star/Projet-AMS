-- Fix critical security vulnerability: Restrict profile visibility
-- Currently all authenticated users can see everyone's personal data
-- This should be restricted to only allow users to see their own profiles

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a secure policy that only allows users to see their own profile
CREATE POLICY "Users can view own profile only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Note: If managers/encadrants need to see their team members' profiles,
-- a separate role-based policy can be added later with proper access controls