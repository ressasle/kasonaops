# SOP: Investor Profile and DNA

## Goal
Capture investment preferences through sliders and attach them to a portfolio ID.

## Inputs
- Investor onboarding data
- Firecrawl extract for portfolio assets

## Outputs
- `investor_profiles` record
- `portfolio_assets` linked by `portfolio_id`

## Setup Steps
1. Create or verify `customer_basic_info` for the company.
2. Create `investor_profiles` with a unique `portfolio_id`.
3. Import portfolio assets via CSV, manual entry, or document extraction.
4. Flag any priority holdings with `watchtower = true`.
5. Run enrichment to populate `ticker_eod` and fundamentals:
   - Single asset (by stock name)
   - Batch by `portfolio_id`
   - Batch by `company_id`
   - Batch by `customer_id` (all portfolios)

## Profile Variables
- `data_granularity` (1-5)
- `action_frequency` (1-5)
- `risk_appetite` (1-5)
- `decision_logic` (1-5)
- `buy_box_trigger_1-3`
- `noise_filter`

## Rules
- All sliders default to 3 if user skips.
- Portfolio assets must include `ticker` or `isin`.
- `ticker_eod` must follow `{SYMBOL}.{EXCHANGE}` format.
