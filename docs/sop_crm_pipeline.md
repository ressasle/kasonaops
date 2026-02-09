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

## Firecrawl Enrichment Mapping (`kasona_customer_basic_info`)

### Preconditions
- `website` must be present on the customer record.
- Firecrawl scrape is run against that website URL.
- Enrichment updates only high-confidence fields; unknown values remain unchanged.

### Auto-fillable Fields
| Column | Source | Rule |
|---|---|---|
| `website` | existing CRM value | Required input, normalized URL |
| `company_name` | page metadata title | Used only when title is clear and current value is weak/missing |
| `email` | scraped markdown text | First valid business email if current email is empty |
| `phone` | scraped markdown text | First valid phone-like value if current phone is empty |
| `industry` | keyword matching in page copy | Set when explicit keywords map to known CRM industries |
| `product_type` | keyword matching in page copy | Set when service/product wording is explicit |
| `hq_location` | "based/headquartered in" patterns | City/location string when confidence is high |
| `country` | location parsing / metadata | Country extracted from strong location cues |
| `notes` | Firecrawl summary + evidence | Append enrichment snapshot (never delete existing notes) |
| `status` | CRM logic | Auto-advance to `Lead Enriched` only when enrichment produced real field updates |

### Not Auto-filled (Manual)
- `action_status`, `source`, `type`, `owner_id`, `contract_size`, `billing_*`, `payment_terms`
- Any financial/deal-probability fields
- Any field with low-confidence extraction

## Edge Cases
- Missive label mismatch: reconcile to CRM status manually.
- Procurement delay: set reminder and re-open after 48h.
