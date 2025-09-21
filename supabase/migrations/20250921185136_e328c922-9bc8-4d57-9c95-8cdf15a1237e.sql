-- Nettoyer complètement tous les comptes admin@admin.fr
DELETE FROM public.profiles WHERE email = 'admin@admin.fr';
DELETE FROM auth.users WHERE email = 'admin@admin.fr';

-- Créer un nouveau compte admin avec un UUID spécifique
DO $$
DECLARE
    new_user_id uuid := gen_random_uuid();
BEGIN
    -- Insérer dans auth.users
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
        is_super_admin
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_user_id,
        'authenticated',
        'authenticated',
        'admin@admin.fr',
        crypt('admin123', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        false
    );

    -- Insérer dans profiles
    INSERT INTO public.profiles (user_id, email, full_name, role)
    VALUES (new_user_id, 'admin@admin.fr', 'Administrator', 'admin');
END $$;