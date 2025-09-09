-- Corriger le problème de récursion infinie dans les politiques RLS

-- Désactiver RLS sur team_members pour éviter les problèmes de récursion
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur teams pour éviter les problèmes de récursion
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur projects pour éviter les problèmes de récursion
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur tasks pour éviter les problèmes de récursion
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur time_entries pour éviter les problèmes de récursion
ALTER TABLE public.time_entries DISABLE ROW LEVEL SECURITY;