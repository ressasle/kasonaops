# SOP: Data Model and IDs

## Goal
Maintain a single source of truth in Supabase for CRM, investor profiles, and portfolio assets.

## Supabase Tables (Kasona CRM project)

| Table | Purpose | PK |
|---|---|---|
| `kasona_customer_basic_info` | Customer/company master data | `company_id` (int, auto-increment) |
| `kasona_customer_contacts` | Multiple contact persons per company | `id` (uuid) |
| `kasona_customer_documents` | Files and notes per company | `id` (uuid) |
| `kasona_investor_profiles` | Investor DNA, subscriptions, portfolio config | `id` (uuid) |
| `kasona_portfolio_assets` | Individual holdings per portfolio | `id` (uuid) |
| `kasona_team_members` | Internal team, HR data, app roles & permissions | `member_id` (text slug) |
| `kasona_deals` | Commercial milestones tied to a company | `id` (uuid) |
| `kasona_transactions` | Payment events linked to a deal or company | `id` (uuid) |

> ✅ `kasona_team_members` is live with 7 seed members. `owner_id` FK on `kasona_customer_basic_info` and `creator_id`/`owner_id` on `kasona_investor_profiles` point to `kasona_team_members.member_id`.

## Inputs
- Supabase tables listed above
- Waiting list CSV for initial lead seeding

## Outputs
- Consistent company and portfolio identifiers
- Stable joins across customer, profile, and asset views

## Rules
- `company_id` is the primary customer key (FK on all related tables).
- `portfolio_id` is unique on `kasona_investor_profiles` and ties profiles to assets.
- `type` on `kasona_customer_basic_info` accepts: `customer`, `partner`, `supplier`, `other`.
- `payment_terms` is `integer` (days, e.g. 14, 30, 60).
- `kasona_portfolio_assets` does **NOT** store `shares` or `avg_cost` — only asset identifiers + enrichment metadata.
- Update `customer_basic_info.status` and `action_status` on every meaningful stage change.

## EOD Enrichment Mapping (kasona_portfolio_assets)

| Column | EODHD Source |
|---|---|
| `ticker_eod` | `{SYMBOL}.{EXCHANGE}` from `get_stocks_from_search` |
| `ticker` | `Code` or `Ticker` from search result |
| `stock_name` | `General.Name` (fallback: search `Name`) |
| `exchange` | `General.Exchange` (fallback: search `Exchange`) |
| `exchange_code` | Exchange code used in `{SYMBOL}.{EXCHANGE}` |
| `country` | `General.CountryISO` (fallback: search `Country`) |
| `country_name` | `General.CountryName` |
| `category` | Search `Type` or `General.Type` |
| `sector` | `General.Sector` |
| `industry` | `General.Industry` |
| `description` | `General.Description` |
| `officers` | `Officers` section (raw JSONB) |
| `currency` | `General.CurrencyCode` |
| `isin` | `General.ISIN` |
| `asset_class` | Normalized from `General.Type` → `Crypto`/`ETF`/`Stocks`/`Other` |
| `website_url` | `General.WebURL` |
| `logo_url` | `General.LogoURL` |
| `fiscal_year_end` | `General.FiscalYearEnd` |
| `other_listings` | `General.Listings` (raw JSONB) |

- `bourse`: deprecated, use `exchange` instead.
- Do not overwrite `owner_comment`, IDs, or existing non-empty fields unless enrichment provides a value.

## Edge Cases
- Duplicate leads: merge by email, preserve highest stage.
- Missing email: keep record but flag for enrichment.
