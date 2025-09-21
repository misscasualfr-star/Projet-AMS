-- Supprimer les comptes existants s'ils existent
DELETE FROM auth.users WHERE email = 'admin@admin.fr';
DELETE FROM public.profiles WHERE email = 'admin@admin.fr';

-- Insérer le compte admin directement dans auth.users avec le mot de passe hashé
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@admin.fr',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  '',
  '',
  '',
  ''
);

-- Insérer le profil admin
INSERT INTO public.profiles (user_id, email, full_name, role)
SELECT id, 'admin@admin.fr', 'Administrator', 'admin'
FROM auth.users WHERE email = 'admin@admin.fr';