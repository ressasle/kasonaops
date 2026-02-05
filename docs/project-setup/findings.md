# Findings

## Research
- Reviewed operations manual, automation rules, sales funnel, product packaging, investor profiles, investment DNA, Firecrawl specs, style guide, Supabase schema.
- Reference folder contains `design_inspo/2.1.1.3_portfolio-briefing-main` only; no `@head-of-investment` or `@quartals-kompass` found yet.

## Constraints
- Source of truth is a database (Supabase).
- Outputs delivered locally to files.

## Decisions
- North Star: CRM/operations tool to track customer stage and fulfillment for personalized podcasts by company/customer ID.
- Integrations: Supabase, Gmail, Missive, PDF generation, ElevenLabs (podcast generation).
- Phase 1 output is a local admin UI prototype aligned to style guide.
- Tasks live as raw JSON for now; needs persistent storage later (likely Missive or Supabase).
