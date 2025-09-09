-- CORRECTION DU PROBLÈME SECURITY DEFINER (approche par étapes)

-- 1. Supprimer d'abord toutes les politiques qui dépendent de la fonction
DROP POLICY IF EXISTS "Only admins can view employee personal data" ON public.salaries;
DROP POLICY IF EXISTS "Only admins can insert employee data" ON public.salaries;  
DROP POLICY IF EXISTS "Only admins can update employee data" ON public.salaries;
DROP POLICY IF EXISTS "Only admins can delete employee data" ON public.salaries;

-- 2. Maintenant supprimer la fonction SECURITY DEFINER
DROP FUNCTION IF EXISTS public.is_admin();

-- 3. Créer des politiques RLS directes SANS fonction SECURITY DEFINER
-- C'est plus sécurisé car cela évite les risques de contournement des politiques RLS

CREATE POLICY "Admin only: view employee personal data" 
ON public.salaries FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admin only: insert employee data" 
ON public.salaries FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admin only: update employee data" 
ON public.salaries FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admin only: delete employee data" 
ON public.salaries FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- 4. Supprimer aussi la vue qui n'est plus nécessaire
DROP VIEW IF EXISTS public.salaries_safe;