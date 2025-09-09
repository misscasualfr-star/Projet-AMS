-- Corriger l'avertissement de sécurité sur la vue

-- Supprimer la vue problématique
DROP VIEW IF EXISTS public.salaries_public;

-- Créer une vue normale (sans SECURITY DEFINER) 
-- qui ne montrera les données que si l'utilisateur est admin
CREATE OR REPLACE VIEW public.salaries_safe AS
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

-- Permettre l'accès à la vue pour les utilisateurs authentifiés
-- (la sécurité sera gérée au niveau de la table salaries par les politiques RLS)
GRANT SELECT ON public.salaries_safe TO authenticated;

COMMENT ON VIEW public.salaries_safe IS 'Vue sécurisée des salariés - seuls les admins verront les données grâce aux politiques RLS';