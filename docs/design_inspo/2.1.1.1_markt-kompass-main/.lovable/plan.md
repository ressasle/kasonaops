

# Plan: Feedback speichern & Email in Profiles

## Übersicht

Zwei Änderungen werden umgesetzt:
1. **Neue Tabelle `user_feedback`** - speichert alle Feedback-Eingaben aus dem Kontaktformular
2. **Email-Spalte in `profiles`** - synchronisiert die Email aus dem Auth-System

---

## Teil 1: Feedback-Formular speichern

### Datenbank-Migration

Neue Tabelle `user_feedback`:

```sql
CREATE TABLE public.user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
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
```

### Code-Änderung: Kontakt.tsx

Die `handleFeedbackSubmit` Funktion wird angepasst:

```typescript
const handleFeedbackSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const { error } = await supabase
    .from('user_feedback')
    .insert({
      user_id: user?.id,
      wants_stocks: stocks,
      wants_tradelog: tradelog,
      wants_allocation: allocation,
      more_commodities: moreCommodities || null,
      more_indices: moreIndices || null,
      more_currencies: moreCurrencies || null,
      other_feedback: otherFeedback || null,
    });
    
  if (error) {
    toast({ title: 'Fehler', variant: 'destructive' });
  } else {
    toast({ title: t('contact.feedbackSent') });
    // Reset form...
  }
};
```

---

## Teil 2: Email in Profiles-Tabelle

### Datenbank-Migration

```sql
-- Email-Spalte hinzufügen
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
```

### Ergebnis nach Migration

| id | full_name | email |
|----|-----------|-------|
| 722ee... | Julian Elsässer | elsaesser.julian@gmail.com |

---

## Dateien die geändert werden

| Datei | Änderung |
|-------|----------|
| Migration | Neue `user_feedback` Tabelle + `email` Spalte in `profiles` |
| `src/pages/Kontakt.tsx` | Feedback in Datenbank speichern statt nur Toast |

---

## Sicherheit

- **user_feedback**: Nur authentifizierte Nutzer können eigenes Feedback einfügen, nur Admins können alle Einträge sehen
- **profiles.email**: Bleibt durch bestehende RLS geschützt (nur eigenes Profil sichtbar)

