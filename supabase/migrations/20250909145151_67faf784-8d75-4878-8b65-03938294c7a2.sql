-- Permettre l'accès aux encadrants et salariés même sans authentification
-- Car cette application semble être utilisée localement sans système d'auth

-- Désactiver RLS sur encadrants pour permettre l'accès libre
ALTER TABLE public.encadrants DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur salaries pour permettre l'accès libre  
ALTER TABLE public.salaries DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur disponibilites pour permettre l'accès libre
ALTER TABLE public.disponibilites DISABLE ROW LEVEL SECURITY;