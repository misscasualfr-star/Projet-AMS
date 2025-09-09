-- Update user role to admin for admin@ams.fr
-- This will set the admin role for any user with the email admin@ams.fr
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@ams.fr';

-- If the profile doesn't exist yet, we'll also create a function to auto-set admin role for this email
CREATE OR REPLACE FUNCTION public.set_admin_role_for_specific_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If the user email is admin@ams.fr, set role to admin
  IF NEW.email = 'admin@ams.fr' THEN
    NEW.role = 'admin';
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to automatically set admin role for admin@ams.fr
DROP TRIGGER IF EXISTS auto_set_admin_role ON public.profiles;
CREATE TRIGGER auto_set_admin_role
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_admin_role_for_specific_email();