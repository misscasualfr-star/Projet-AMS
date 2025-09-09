-- CORRECTION DU PROBLÈME DE SÉCURITÉ : Restriction d'accès aux données personnelles des salariés

-- 1. Supprimer les politiques actuelles trop permissives
DROP POLICY "Authenticated users can view salaries" ON public.salaries;
DROP POLICY "Authenticated users can insert salaries" ON public.salaries;
DROP POLICY "Authenticated users can update salaries" ON public.salaries;
DROP POLICY "Authenticated users can delete salaries" ON public.salaries;

-- 2. Créer une fonction security definer pour vérifier le rôle administrateur
-- Cela évite la récursion infinie dans les politiques RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier si l'utilisateur connecté a le rôle 'admin' dans la table profiles
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- 3. Créer des politiques restrictives pour les administrateurs seulement
CREATE POLICY "Only admins can view employee personal data" 
ON public.salaries FOR SELECT 
TO authenticated 
USING (public.is_admin());

CREATE POLICY "Only admins can insert employee data" 
ON public.salaries FOR INSERT 
TO authenticated 
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update employee data" 
ON public.salaries FOR UPDATE 
TO authenticated 
USING (public.is_admin());

CREATE POLICY "Only admins can delete employee data" 
ON public.salaries FOR DELETE 
TO authenticated 
USING (public.is_admin());

-- 4. Créer une vue publique sécurisée pour les données non-sensibles si nécessaire
-- (pour affichage dans les plannings sans exposer les données personnelles)
CREATE OR REPLACE VIEW public.salaries_public AS
SELECT 
  id,
  nom,
  niveau_autonomie,
  conducteur,
  actif,
  encadrant_referent_id,
  contrat_debut,
  contrat_fin,
  created_at,
  updated_at
FROM public.salaries;

-- 5. Permettre aux utilisateurs authentifiés de voir la vue publique (sans données sensibles)
CREATE POLICY "Authenticated users can view public employee info"
ON public.salaries_public FOR SELECT 
TO authenticated 
USING (true);

COMMENT ON VIEW public.salaries_public IS 'Vue publique des salariés sans données personnelles sensibles (email, téléphone)';