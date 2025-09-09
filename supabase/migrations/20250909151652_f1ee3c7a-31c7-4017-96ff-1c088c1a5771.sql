-- Ajouter la colonne client_id à la table projects
ALTER TABLE public.projects 
ADD COLUMN client_id UUID REFERENCES public.clients(id);

-- Ajouter les colonnes pour les besoins en personnel
ALTER TABLE public.projects 
ADD COLUMN besoins_encadrants INTEGER DEFAULT 0,
ADD COLUMN besoins_salaries INTEGER DEFAULT 0,
ADD COLUMN type TEXT;