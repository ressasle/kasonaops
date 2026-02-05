# Project Constitution

## Data Schemas
### Supabase Input (Canonical)
```json
{
  "team_members": [
    {
      "id": "uuid",
      "name": "string",
      "role": "string",
      "email": "string|null"
    }
  ],
  "customer_basic_info": [
    {
      "company_id": "int",
      "company_name": "string",
      "contact_person_name": "string|null",
      "category": "string|null",
      "email": "string|null",
      "website": "string|null",
      "phone": "string|null",
      "industry": "Investing|Industrial Services|Consulting|E-Commerce|null",
      "action_status": "Renewed|To Expand|Backlog|New|To Check|Reminder Set|To Reach Out|Mail Sent|null",
      "reminder_date": "timestamp|null",
      "source": "Inbound|Outbound|null",
      "type": "Customer|Warm Lead|null",
      "n_portfolios": "int",
      "status": "Churned|Closed Lost|Expanded|Closed Won|Paid User|Free User|Offer Sent|Offer Generated|Meeting Booked|Lead Manget Sent|Lead Enriched|Lead Captured|Lead Identified|null",
      "product_type": "string|null",
      "hq_location": "string|null",
      "country": "string|null",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "contract_size": "number|null",
      "start_date": "date|null",
      "end_date": "date|null",
      "charge_type": "Reatiner|Per Hour|Package|Fixed Fee|null",
      "billing_type": "Quarterly|Monthly|Project-based|Per Output|null",
      "billing_address": "string|null",
      "billing_email": "string|null",
      "is_current": "boolean",
      "entered_at": "timestamp|null",
      "exited_at": "timestamp|null",
      "days_in_stage": "int|null",
      "expected_deal_value": "number|null",
      "probability": "int|null",
      "fit_tier": "string|null",
      "previous_stage": "string|null",
      "changed_by": "string|null",
      "change_reason": "string|null",
      "notes": "string|null"
    }
  ],
  "investor_profiles": [
    {
      "id": "uuid",
      "company_id": "int",
      "customer_name": "string|null",
      "portfolio_id": "string",
      "portfolio_name": "string|null",
      "creator_id": "uuid|null",
      "owner_id": "uuid|null",
      "product_status": "to create|created|to review|to send|sent out|null",
      "subscribed_quartals": "boolean",
      "subscribed_stock_chatbot": "boolean",
      "subscribed_portfolio_briefing": "boolean",
      "subscribed_investment_analysis": "boolean",
      "subscribed_deep_research": "boolean",
      "subscribed_body_language_analysis": "boolean",
      "last_document_link": "string|null",
      "recipient_email": "string|null",
      "telegram_id": "string|null",
      "output_format": "Podcast|Newsletter|Other|null",
      "output_frequency": "weekly|bi-weekly|monthly|daily|quarterly|null",
      "days_to_check": "int|null",
      "data_granularity": "int|null",
      "action_frequency": "int|null",
      "risk_appetite": "int|null",
      "decision_logic": "int|null",
      "buy_box_trigger_1": "string|null",
      "buy_box_trigger_2": "string|null",
      "buy_box_trigger_3": "string|null",
      "investment_philosophy": "string|null",
      "noise_filter": "string|null",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "portfolio_assets": [
    {
      "id": "uuid",
      "portfolio_id": "string",
      "company_id": "int",
      "ticker": "string|null",
      "stock_name": "string|null",
      "bourse": "string|null",
      "exchange": "string|null",
      "exchange_code": "string|null",
      "country": "string|null",
      "country_name": "string|null",
      "category": "string|null",
      "sector": "string|null",
      "industry": "string|null",
      "description": "string|null",
      "officers": "json|null",
      "owner_comment": "string|null",
      "currency": "string|null",
      "ticker_finnhub": "string|null",
      "ticker_eod": "string|null",
      "isin": "string|null",
      "asset_class": "Crypto|Stocks|ETF|Other|null",
      "website_url": "string|null",
      "logo_url": "string|null",
      "fiscal_year_end": "string|null",
      "other_listings": "json|null",
      "watchtower": "boolean|null"
    }
  ]
}
```

### Firecrawl Extract Payload (Portfolio Ingestion)
```json
{
  "tickers": ["string"],
  "asset_class": ["string"],
  "isin": ["string"]
}
```

### Local Output Payload (Admin Dashboard View Model)
```json
{
  "generated_at": "timestamp",
  "source": {
    "supabase_project": "string",
    "schema": "public"
  },
  "customers": [
    {
      "company_id": "int",
      "company_name": "string",
      "contact_person_name": "string|null",
      "email": "string|null",
      "status": "string|null",
      "action_status": "string|null",
      "stage_days": "int|null",
      "expected_deal_value": "number|null",
      "probability": "int|null",
      "product_type": "string|null",
      "owner_id": "uuid|null",
      "last_touch": "timestamp|null"
    }
  ],
  "investor_profiles": [
    {
      "company_id": "int",
      "portfolio_id": "string",
      "portfolio_name": "string|null",
      "product_status": "string|null",
      "output_format": "string|null",
      "output_frequency": "string|null",
      "data_granularity": "int|null",
      "action_frequency": "int|null",
      "decision_logic": "int|null",
      "risk_appetite": "int|null",
      "buy_box_triggers": ["string"],
      "noise_filter": "string|null",
      "last_document_link": "string|null"
    }
  ],
  "portfolio_assets": [
    {
      "portfolio_id": "string",
      "ticker": "string|null",
      "stock_name": "string|null",
      "isin": "string|null",
      "asset_class": "string|null"
    }
  ],
  "pipeline_summary": [
    {
      "status": "string",
      "count": "int",
      "total_expected_value": "number"
    }
  ],
  "tasks": [
    {
      "task_id": "string",
      "company_id": "int|null",
      "owner_id": "uuid|null",
      "title": "string",
      "status": "todo|in_progress|blocked|done",
      "priority": "low|medium|high",
      "due_date": "date|null",
      "source": "manual|automation"
    }
  ]
}
```

## Behavioral Rules
- Follow B.L.A.S.T. and A.N.T. protocols.
- Precise and conservative; no guessing at business logic.

## Architectural Invariants
- Update SOPs before code changes.
