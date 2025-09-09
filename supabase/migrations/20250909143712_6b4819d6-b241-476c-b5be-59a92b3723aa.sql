-- Create tables for storing availability data for both encadrants and salaries
-- This will allow persistent storage of availability changes

-- Create encadrants table
CREATE TABLE IF NOT EXISTS public.encadrants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  initiales TEXT,
  telephone TEXT,
  email TEXT,
  couleur TEXT DEFAULT 'hsl(var(--primary))',
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create salaries table  
CREATE TABLE IF NOT EXISTS public.salaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  telephone TEXT,
  email TEXT,
  conducteur BOOLEAN DEFAULT false,
  actif BOOLEAN DEFAULT true,
  encadrant_referent_id UUID REFERENCES public.encadrants(id),
  contrat_debut DATE,
  contrat_fin DATE,
  niveau_autonomie TEXT DEFAULT 'Débutant',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create availability table for both encadrants and salaries
CREATE TABLE IF NOT EXISTS public.disponibilites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personne_type TEXT NOT NULL CHECK (personne_type IN ('ENCADRANT', 'SALARIE')),
  personne_id UUID NOT NULL,
  date DATE NOT NULL,
  statut TEXT NOT NULL DEFAULT 'available' CHECK (statut IN ('available', 'absent', 'suivi', 'formation')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(personne_type, personne_id, date)
);

-- Enable RLS on all tables
ALTER TABLE public.encadrants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salaries ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.disponibilites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for encadrants (allow authenticated users to read/write for now)
CREATE POLICY "Allow authenticated access to encadrants" ON public.encadrants
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create RLS policies for salaries
CREATE POLICY "Allow authenticated access to salaries" ON public.salaries  
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create RLS policies for disponibilites
CREATE POLICY "Allow authenticated access to disponibilites" ON public.disponibilites
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_encadrants_updated_at
  BEFORE UPDATE ON public.encadrants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_salaries_updated_at
  BEFORE UPDATE ON public.salaries  
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_disponibilites_updated_at
  BEFORE UPDATE ON public.disponibilites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for encadrants
INSERT INTO public.encadrants (nom, initiales, telephone, email, couleur) VALUES
('Jean Dupont', 'JD', '06 12 34 56 78', 'j.dupont@ams.fr', 'hsl(var(--primary))'),
('Marie Martin', 'MM', '06 23 45 67 89', 'm.martin@ams.fr', 'hsl(var(--accent))'), 
('Pierre Durand', 'PD', '06 34 56 78 90', 'p.durand@ams.fr', 'hsl(var(--available))'),
('Sophie Lambert', 'SL', '06 45 67 89 01', 's.lambert@ams.fr', 'hsl(var(--formation))')
ON CONFLICT DO NOTHING;

-- Insert sample data for salaries  
INSERT INTO public.salaries (nom, telephone, email, conducteur, encadrant_referent_id, contrat_debut, contrat_fin, niveau_autonomie) 
SELECT 
  'Alexandre Dubois', '06 11 22 33 44', 'a.dubois@ams.fr', true, e.id, '2024-01-15', '2025-12-31', 'Confirmé'
FROM public.encadrants e WHERE e.nom = 'Jean Dupont' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.salaries (nom, telephone, email, conducteur, encadrant_referent_id, contrat_debut, contrat_fin, niveau_autonomie)
SELECT 
  'Fatima Benali', '06 22 33 44 55', 'f.benali@ams.fr', false, e.id, '2024-03-01', '2025-08-31', 'Débutant'  
FROM public.encadrants e WHERE e.nom = 'Jean Dupont' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.salaries (nom, telephone, email, conducteur, encadrant_referent_id, contrat_debut, contrat_fin, niveau_autonomie)
SELECT 
  'Mohamed Karimi', '06 33 44 55 66', 'm.karimi@ams.fr', true, e.id, '2023-09-01', '2025-03-31', 'Confirmé'
FROM public.encadrants e WHERE e.nom = 'Marie Martin' LIMIT 1  
ON CONFLICT DO NOTHING;

INSERT INTO public.salaries (nom, telephone, email, conducteur, encadrant_referent_id, contrat_debut, contrat_fin, niveau_autonomie)
SELECT 
  'Sarah Moreau', '06 44 55 66 77', 's.moreau@ams.fr', false, e.id, '2024-06-15', '2026-01-15', 'Intermédiaire'
FROM public.encadrants e WHERE e.nom = 'Marie Martin' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.salaries (nom, telephone, email, conducteur, encadrant_referent_id, contrat_debut, contrat_fin, niveau_autonomie)
SELECT 
  'David Rousseau', '06 55 66 77 88', 'd.rousseau@ams.fr', true, e.id, '2023-01-01', '2024-12-31', 'Confirmé'
FROM public.encadrants e WHERE e.nom = 'Pierre Durand' LIMIT 1
ON CONFLICT DO NOTHING;