-- Créer la table clients
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom text NOT NULL,
  contact text,
  telephone text,
  email text,
  adresse text,
  couleur text DEFAULT 'hsl(var(--client-1))',
  actif boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Désactiver RLS sur clients pour permettre l'accès libre
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;

-- Ajouter un trigger pour updated_at sur clients
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();