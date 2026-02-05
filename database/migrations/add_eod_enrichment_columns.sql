-- Migration: Add EOD enrichment columns to kasona_portfolio_assets
-- Run this SQL in Supabase SQL Editor to add the new columns

ALTER TABLE kasona_portfolio_assets 
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS fiscal_year_end TEXT,
ADD COLUMN IF NOT EXISTS other_listings JSONB;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'kasona_portfolio_assets' 
ORDER BY ordinal_position;
