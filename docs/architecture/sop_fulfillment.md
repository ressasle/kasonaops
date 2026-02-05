# SOP: Fulfillment and QA

## Goal
Deliver the correct output format and cadence for each portfolio.

## Inputs
- `investor_profiles` output_format, output_frequency
- `portfolio_assets` holdings list

## Outputs
- Production status updates
- Customer delivery assets

## Steps
1. Verify portfolio completeness.
2. Run production workflow on schedule or on-demand.
3. QA against investor profile rules.
4. Set `product_status` and deliver asset link.

## Edge Cases
- Missing holdings: block production and notify owner.
- Output format mismatch: pause and confirm preference.
