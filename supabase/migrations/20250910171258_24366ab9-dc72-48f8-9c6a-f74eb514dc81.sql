-- Fix the disponibilites statut constraint to allow all needed status values
ALTER TABLE public.disponibilites DROP CONSTRAINT IF EXISTS disponibilites_statut_check;

-- Add new constraint with all the status values we need
ALTER TABLE public.disponibilites ADD CONSTRAINT disponibilites_statut_check 
CHECK (statut IN ('available', 'absent', 'conges', 'maladie', 'autre'));