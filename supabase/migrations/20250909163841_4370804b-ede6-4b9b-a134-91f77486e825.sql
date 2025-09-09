-- Activer RLS sur toutes les tables pour sécuriser l'application

-- Tables principales
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encadrants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disponibilites ENABLE ROW LEVEL SECURITY;

-- Tables de relations
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Créer des politiques RLS basiques pour permettre l'accès aux utilisateurs authentifiés
-- (Ces politiques pourront être affinées plus tard selon les besoins)

-- Clients
CREATE POLICY "Authenticated users can view clients" 
ON public.clients FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert clients" 
ON public.clients FOR INSERT 
TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients" 
ON public.clients FOR UPDATE 
TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete clients" 
ON public.clients FOR DELETE 
TO authenticated USING (true);

-- Encadrants
CREATE POLICY "Authenticated users can view encadrants" 
ON public.encadrants FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert encadrants" 
ON public.encadrants FOR INSERT 
TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update encadrants" 
ON public.encadrants FOR UPDATE 
TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete encadrants" 
ON public.encadrants FOR DELETE 
TO authenticated USING (true);

-- Salariés
CREATE POLICY "Authenticated users can view salaries" 
ON public.salaries FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert salaries" 
ON public.salaries FOR INSERT 
TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update salaries" 
ON public.salaries FOR UPDATE 
TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete salaries" 
ON public.salaries FOR DELETE 
TO authenticated USING (true);

-- Projets
CREATE POLICY "Authenticated users can view projects" 
ON public.projects FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert projects" 
ON public.projects FOR INSERT 
TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects" 
ON public.projects FOR UPDATE 
TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete projects" 
ON public.projects FOR DELETE 
TO authenticated USING (true);

-- Disponibilités
CREATE POLICY "Authenticated users can view disponibilites" 
ON public.disponibilites FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert disponibilites" 
ON public.disponibilites FOR INSERT 
TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update disponibilites" 
ON public.disponibilites FOR UPDATE 
TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete disponibilites" 
ON public.disponibilites FOR DELETE 
TO authenticated USING (true);

-- Teams
CREATE POLICY "Authenticated users can view teams" 
ON public.teams FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert teams" 
ON public.teams FOR INSERT 
TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update teams" 
ON public.teams FOR UPDATE 
TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete teams" 
ON public.teams FOR DELETE 
TO authenticated USING (true);

-- Tasks
CREATE POLICY "Authenticated users can view tasks" 
ON public.tasks FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert tasks" 
ON public.tasks FOR INSERT 
TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update tasks" 
ON public.tasks FOR UPDATE 
TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete tasks" 
ON public.tasks FOR DELETE 
TO authenticated USING (true);

-- Team members
CREATE POLICY "Authenticated users can view team_members" 
ON public.team_members FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert team_members" 
ON public.team_members FOR INSERT 
TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update team_members" 
ON public.team_members FOR UPDATE 
TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete team_members" 
ON public.team_members FOR DELETE 
TO authenticated USING (true);

-- Time entries
CREATE POLICY "Authenticated users can view time_entries" 
ON public.time_entries FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert time_entries" 
ON public.time_entries FOR INSERT 
TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update time_entries" 
ON public.time_entries FOR UPDATE 
TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete time_entries" 
ON public.time_entries FOR DELETE 
TO authenticated USING (true);