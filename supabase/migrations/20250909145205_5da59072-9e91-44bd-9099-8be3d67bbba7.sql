-- Supprimer les politiques RLS inutiles maintenant que RLS est désactivé

-- Supprimer toutes les politiques sur encadrants
DROP POLICY IF EXISTS "Allow authenticated access to encadrants" ON public.encadrants;

-- Supprimer toutes les politiques sur salaries  
DROP POLICY IF EXISTS "Allow authenticated access to salaries" ON public.salaries;

-- Supprimer toutes les politiques sur disponibilites
DROP POLICY IF EXISTS "Allow authenticated access to disponibilites" ON public.disponibilites;