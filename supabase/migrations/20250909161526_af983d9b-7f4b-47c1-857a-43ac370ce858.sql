-- Supprimer toutes les données des tables (en respectant l'ordre des contraintes)

-- D'abord les tables dépendantes
DELETE FROM public.time_entries;
DELETE FROM public.team_members;
DELETE FROM public.tasks;
DELETE FROM public.teams;
DELETE FROM public.affectations;
DELETE FROM public.disponibilites;

-- Ensuite les tables principales
DELETE FROM public.projects;
DELETE FROM public.encadrants;
DELETE FROM public.salaries;
DELETE FROM public.clients;

-- Garder la table profiles car elle contient les données utilisateur
-- DELETE FROM public.profiles; -- Commenté pour garder les profils utilisateur