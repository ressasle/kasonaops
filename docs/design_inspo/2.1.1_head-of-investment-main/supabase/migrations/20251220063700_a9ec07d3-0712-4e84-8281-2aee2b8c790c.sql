-- Extend profiles table with account_id and product fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'briefing';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS product_interval TEXT DEFAULT 'weekly';

-- Create unique index for account_id lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_account_id ON public.profiles(account_id) WHERE account_id IS NOT NULL;

-- Create holdings_v2 table with full CSV structure including ticker_eod
CREATE TABLE IF NOT EXISTS public.holdings_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  
  -- Core fields
  ticker TEXT NOT NULL,
  name TEXT NOT NULL,
  
  -- Extended metadata from CSV
  exchange TEXT,
  country TEXT,
  category TEXT,
  sector TEXT,
  owner_comment TEXT,
  currency TEXT,
  
  -- API Tickers (CRITICAL for n8n integrations)
  ticker_finnhub TEXT,
  ticker_eod TEXT,
  isin TEXT,
  
  -- Quantitative data
  shares NUMERIC,
  avg_cost NUMERIC,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Multi-tenancy indexes for n8n queries
CREATE INDEX IF NOT EXISTS idx_holdings_v2_account_id ON public.holdings_v2(account_id);
CREATE INDEX IF NOT EXISTS idx_holdings_v2_ticker_eod ON public.holdings_v2(ticker_eod);
CREATE INDEX IF NOT EXISTS idx_holdings_v2_user_id ON public.holdings_v2(user_id);

-- Enable RLS
ALTER TABLE public.holdings_v2 ENABLE ROW LEVEL SECURITY;

-- RLS Policies for holdings_v2
CREATE POLICY "Users can view own holdings_v2" ON public.holdings_v2
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own holdings_v2" ON public.holdings_v2
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own holdings_v2" ON public.holdings_v2
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own holdings_v2" ON public.holdings_v2
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all holdings_v2" ON public.holdings_v2
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert holdings_v2" ON public.holdings_v2
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update holdings_v2" ON public.holdings_v2
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete holdings_v2" ON public.holdings_v2
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_holdings_v2_updated_at
  BEFORE UPDATE ON public.holdings_v2
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create investor_profiles_v2 table with behavioral scores
CREATE TABLE IF NOT EXISTS public.investor_profiles_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  account_id TEXT NOT NULL UNIQUE,
  
  -- Behavioral Scores (1-5 scale)
  data_granularity INTEGER DEFAULT 3,
  action_frequency INTEGER DEFAULT 3,
  risk_appetite INTEGER DEFAULT 3,
  decision_logic INTEGER DEFAULT 3,
  
  -- Buy-Box Definition
  buy_box_triggers TEXT[] DEFAULT '{}',
  
  -- Investment Philosophy
  investment_philosophy TEXT,
  
  -- Noise Filters
  noise_filters TEXT[] DEFAULT '{}',
  
  -- AI Configuration
  system_prompt TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for multi-tenancy
CREATE INDEX IF NOT EXISTS idx_investor_profiles_v2_account_id ON public.investor_profiles_v2(account_id);
CREATE INDEX IF NOT EXISTS idx_investor_profiles_v2_user_id ON public.investor_profiles_v2(user_id);

-- Enable RLS
ALTER TABLE public.investor_profiles_v2 ENABLE ROW LEVEL SECURITY;

-- RLS Policies for investor_profiles_v2
CREATE POLICY "Users can view own investor_profile_v2" ON public.investor_profiles_v2
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investor_profile_v2" ON public.investor_profiles_v2
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investor_profile_v2" ON public.investor_profiles_v2
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all investor_profiles_v2" ON public.investor_profiles_v2
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert investor_profiles_v2" ON public.investor_profiles_v2
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update investor_profiles_v2" ON public.investor_profiles_v2
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_investor_profiles_v2_updated_at
  BEFORE UPDATE ON public.investor_profiles_v2
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();