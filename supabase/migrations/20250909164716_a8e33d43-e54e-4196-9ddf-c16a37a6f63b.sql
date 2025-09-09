-- CORRECTION DU PROBLÈME SECURITY DEFINER
-- Remplacer la fonction SECURITY DEFINER par une approche plus sécurisée

-- 1. Supprimer la vue qui n'est plus nécessaire
DROP VIEW IF EXISTS public.salaries_safe;

-- 2. Recréer la fonction is_admin avec une approche plus sécurisée
-- en utilisant SECURITY INVOKER au lieu de DEFINER
DROP FUNCTION IF EXISTS public.is_admin();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier si l'utilisateur connecté a le rôle 'admin' dans la table profiles
  -- SECURITY INVOKER est plus sûr car il utilise les permissions de l'utilisateur appelant
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE SET search_path = public;

-- 3. Alternative : Utiliser directement les politiques RLS sans fonction
-- Recréer les politiques pour les salariés avec une approche directe

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Only admins can view employee personal data" ON public.salaries;
DROP POLICY IF EXISTS "Only admins can insert employee data" ON public.salaries;
DROP POLICY IF EXISTS "Only admins can update employee data" ON public.salaries;
DROP POLICY IF EXISTS "Only admins can delete employee data" ON public.salaries;

-- Créer des politiques RLS directes sans fonction SECURITY DEFINER
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

COMMENT ON FUNCTION public.is_admin() IS 'Vérifie si l''utilisateur connecté est administrateur - SECURITY INVOKER pour plus de sécurité';