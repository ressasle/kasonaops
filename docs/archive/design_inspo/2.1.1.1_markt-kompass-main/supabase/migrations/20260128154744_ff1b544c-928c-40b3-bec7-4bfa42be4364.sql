-- Remove email column from profiles table to prevent data duplication
-- Email is already stored in auth.users and accessed via user session

-- First update the trigger to not insert email anymore
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

-- Then drop the email column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;