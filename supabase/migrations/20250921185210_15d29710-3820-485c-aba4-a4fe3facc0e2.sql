-- Mettre à jour le mot de passe du compte existant admin@admin.fr
UPDATE auth.users 
SET 
    encrypted_password = crypt('admin123', gen_salt('bf')),
    email_confirmed_at = now(),
    updated_at = now()
WHERE id = '5c01f0e3-027b-47f6-8ba3-45153a5089e6';

-- S'assurer que le profil a bien le rôle admin
UPDATE public.profiles 
SET role = 'admin', updated_at = now()
WHERE user_id = '5c01f0e3-027b-47f6-8ba3-45153a5089e6';