-- Teil 1: Neue user_feedback Tabelle
CREATE TABLE public.user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wants_stocks boolean DEFAULT false,
  wants_tradelog boolean DEFAULT false,
  wants_allocation boolean DEFAULT false,
  more_commodities text,
  more_indices text,
  more_currencies text,
  other_feedback text,
  created_at timestamptz DEFAULT now()
);

-- RLS aktivieren
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Nur authentifizierte Nutzer können eigenes Feedback erstellen
CREATE POLICY "Users can insert own feedback"
  ON public.user_feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins können alles sehen (für Auswertung)
CREATE POLICY "Admins can view all feedback"
  ON public.user_feedback FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Teil 2: Email-Spalte in profiles hinzufügen
ALTER TABLE public.profiles ADD COLUMN email text;

-- Bestehende Emails aus auth.users synchronisieren
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;

-- Trigger aktualisieren: Email bei Signup speichern
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$;