-- Donner les droits admin à admin@admin.fr
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@admin.fr';