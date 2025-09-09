-- Nettoyer toutes les politiques RLS orphelines

-- Supprimer politiques sur projects
DROP POLICY IF EXISTS "Managers can create projects" ON public.projects;
DROP POLICY IF EXISTS "Managers can update their projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view projects they're involved in" ON public.projects;

-- Supprimer politiques sur tasks
DROP POLICY IF EXISTS "Project managers and assignees can manage tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view tasks in their projects" ON public.tasks;

-- Supprimer politiques sur teams
DROP POLICY IF EXISTS "Project managers can manage teams" ON public.teams;
DROP POLICY IF EXISTS "Users can view teams in their projects" ON public.teams;

-- Supprimer politiques sur team_members
DROP POLICY IF EXISTS "Project managers can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can view team members in their projects" ON public.team_members;

-- Supprimer politiques sur time_entries
DROP POLICY IF EXISTS "Users can manage their time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can view their time entries" ON public.time_entries;