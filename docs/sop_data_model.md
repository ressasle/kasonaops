# SOP: Data Model and IDs

## Goal
Maintain a single source of truth in Supabase for CRM, investor profiles, and portfolio assets.

## Inputs
- Supabase tables: `team_members`, `customer_basic_info`, `investor_profiles`, `portfolio_assets`
- Waiting list CSV for initial lead seeding

## Outputs
- Consistent company and portfolio identifiers
- Stable joins across customer, profile, and asset views

## Rules
- `company_id` is the primary customer key.
- `portfolio_id` is unique and ties profiles to assets.
- Update `customer_basic_info.status` and `action_status` on every meaningful stage change.

## EOD Enrichment Mapping (portfolio_assets)
- `ticker_eod`: `{SYMBOL}.{EXCHANGE}` built from `get_stocks_from_search` result `Code` + `Exchange`.
- `ticker`: `Code` or `Ticker` from search result.
- `stock_name`: `General.Name` (fallback to search `Name`).
- `exchange`: `General.Exchange` or `get_exchange_tickers.Exchange` (fallback to search `Exchange`).
- `exchange_code`: exchange code used in `{SYMBOL}.{EXCHANGE}`.
- `country`: `General.CountryISO` (fallback to search `Country`).
- `country_name`: `General.CountryName` (fallback to search `Country`).
- `category`: search `Type` or `General.Type`.
- `sector`: `General.Sector`.
- `industry`: `General.Industry`.
- `description`: `General.Description`.
- `officers`: `Officers` section (raw JSON).
- `currency`: `General.CurrencyCode` (fallback to search `Currency`).
- `isin`: `General.ISIN` (fallback to search `ISIN`/`Isin`).
- `asset_class`: normalized from `General.Type` (Crypto/ETF/Stocks/Other).
- `website_url`: `General.WebURL` (fallback to `General.Website`/`General.WebsiteURL`).
- `logo_url`: `General.LogoURL` (fallback to `General.Logo`).
- `fiscal_year_end`: `General.FiscalYearEnd`.
- `other_listings`: `General.Listings` or `General.OtherListings` (raw JSON).
- `bourse`: no longer updated; use `exchange` instead.
- Do not overwrite `owner_comment`, IDs, or any existing non-empty fields unless enrichment provides a value.

## Edge Cases
- Duplicate leads: merge by email, preserve highest stage.
- Missing email: keep record but flag for enrichment.
