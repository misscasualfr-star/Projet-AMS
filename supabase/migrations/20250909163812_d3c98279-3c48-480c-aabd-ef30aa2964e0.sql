-- Supprimer toutes les données des tables dans le bon ordre pour éviter les contraintes

-- D'abord les tables dépendantes
DELETE FROM public.time_entries;
DELETE FROM public.team_members;
DELETE FROM public.tasks;
DELETE FROM public.teams;
DELETE FROM public.affectations;
DELETE FROM public.disponibilites;

-- Supprimer les projets avant les autres tables
DELETE FROM public.projects;

-- Mettre à NULL les références avant de supprimer les encadrants
UPDATE public.salaries SET encadrant_referent_id = NULL WHERE encadrant_referent_id IS NOT NULL;

-- Maintenant supprimer les encadrants et salariés
DELETE FROM public.encadrants;
DELETE FROM public.salaries;

-- Supprimer les profils utilisateur
DELETE FROM public.profiles;

-- Enfin supprimer les clients
DELETE FROM public.clients;