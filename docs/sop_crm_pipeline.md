# SOP: CRM Pipeline (Sales to Onboarding)

## Goal
Move leads from discovery to paid user with minimal latency and clear ownership.

## Inputs
- `customer_basic_info` table
- Missive conversations and labels
- Calendar events

## Outputs
- Updated CRM stages
- Next actions and reminders

## Stage Flow
1. Lead Identified
2. Lead Captured
3. Lead Enriched
4. Lead Magnet Sent
5. Meeting Booked
6. Offer Generated
7. Offer Sent
8. Free User
9. Paid User
10. Closed Won / Closed Lost / Churned

## Key Actions
- Enrichment via Firecrawl notes into `customer_basic_info.notes`.
- Post-call summary draft created in Missive.
- `/won` triggers onboarding and profile creation.

## Edge Cases
- Missive label mismatch: reconcile to CRM status manually.
- Procurement delay: set reminder and re-open after 48h.
