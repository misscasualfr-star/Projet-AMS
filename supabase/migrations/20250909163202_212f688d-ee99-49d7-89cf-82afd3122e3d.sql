-- Créer un utilisateur administrateur unique
-- Email: admin@ams-planning.fr
-- Mot de passe: AdminAMS2025!
-- Note: L'utilisateur devra être créé manuellement via l'interface Supabase Auth

-- Insérer le profil administrateur (l'UUID sera mis à jour après création du user)
INSERT INTO public.profiles (user_id, email, full_name, role) 
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@ams-planning.fr',
  'Administrateur AMS',
  'admin'
) 
ON CONFLICT (user_id) DO NOTHING;