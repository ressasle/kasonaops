-- Add missing columns to investor_profiles for full onboarding data
ALTER TABLE public.investor_profiles 
ADD COLUMN IF NOT EXISTS exclusion_criteria text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_metrics text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS investment_horizon text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS additional_notes text,
ADD COLUMN IF NOT EXISTS system_prompt text,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create trigger for updated_at on investor_profiles
DROP TRIGGER IF EXISTS update_investor_profiles_updated_at ON public.investor_profiles;
CREATE TRIGGER update_investor_profiles_updated_at
BEFORE UPDATE ON public.investor_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();