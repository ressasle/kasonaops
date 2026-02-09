# SOP: Portfolio Assets Setup

> Complete guide for setting up and enriching portfolio assets in Kasona Ops

---

## Prerequisites

Before adding portfolio assets, ensure:

| Requirement | Table | Status Check |
|-------------|-------|--------------|
| Customer exists | `customer_basic_info` | Has `company_id` |
| Investor profile exists | `investor_profiles` | Has `portfolio_id` linked to customer |

### Investor Profile Variables (Investment DNA)

| Variable | Scale | Low (1-2) | High (4-5) |
|----------|-------|-----------|------------|
| `data_granularity` | 1-5 | Big Picture, no decimals | Exact EPS, basis points |
| `action_frequency` | 1-5 | Long-term observer | Active trader, urgent CTAs |
| `risk_appetite` | 1-5 | Conservative | Aggressive |
| `decision_logic` | 1-5 | Emotional/Story | Rational "If A then B" |

Additional fields:
- `buy_box_trigger_1-3`: Investment triggers (e.g., "Quality Pullback >25%")
- `noise_filter`: Negative constraints (e.g., "Ignore macro-economics")

---

## Input Options

### Option 1: Manual Entry
**Status**: ✅ Available

1. Navigate to customer → investor profile → portfolio
2. Click "Add Asset"
3. Enter `stock_name` (required)
4. Optionally add: `ticker`, `isin`, `currency`, `sector`, `asset_class`
5. Save → triggers auto-enrichment

**Employee fills**: `stock_name`, optional details

---

### Option 2: PDF/Screenshot Upload
**Status**: ✅ Available

1. Navigate to portfolio
2. Click "Upload Document"
3. Upload PDF or screenshot
4. AI extracts assets via `/api/portfolio-assets/extract`
5. Review extracted data
6. Confirm → bulk insert → auto-enrich

**Employee fills**: Upload file, review/confirm extracted data

---

### Option 3: CSV Import / Bulk Upload
**Status**: ✅ Available

1. Use "Import Assets" in Portfolio Manager.
2. Supports:
    - **CSV**: Columns `stock_name`, `ticker`, `isin`, `currency`, `asset_class`
    - **PDF**: Bank statements (AI extraction)
    - **Images**: Screenshots of portfolio (AI extraction)
3. Review extracted data in the dialog.
4. Confirm to bulk insert -> auto-enrich.

---

### Option 4: Investor Profile Import
**Status**: ✅ Available

1. Go to **Investor Profile Manager**.
2. Click "Import CSV".
3. Upload CSV with headers: `portfolio_id` (mandatory), `risk_appetite`, `data_granularity`, `output_format`.
4. System bulk upserts profiles matched by `portfolio_id`.

---

## Enrichment Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                        ASSET ENRICHMENT                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. INSERT ASSET (stock_name required)                          │
│         ↓                                                       │
│  2. SEARCH EODHD (by stock_name/ticker/isin)                    │
│         ↓                                                       │
│  ┌──────┴──────┐                                                │
│  │  Match?     │                                                │
│  └──────┬──────┘                                                │
│    YES  │  NO                                                   │
│    ↓    ↓                                                       │
│  ┌──────┴──────┐   ┌─────────────────────────────────────────┐  │
│  │ POPULATE    │   │ ERROR: "No confident match found"       │  │
│  │ 20+ columns │   │ → Asset marked for manual review        │  │
│  │ from EODHD  │   │ → Employee notified via asset status    │  │
│  └─────────────┘   └─────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Columns Populated by Enrichment

| Column | Source |
|--------|--------|
| `ticker_eod` | EODHD search |
| `exchange` / `exchange_code` | EODHD fundamentals |
| `country` / `country_name` | EODHD fundamentals |
| `sector` / `industry` | EODHD fundamentals |
| `description` | EODHD fundamentals |
| `officers` | EODHD fundamentals |
| `isin` | EODHD fundamentals |
| `website_url` / `logo_url` | EODHD fundamentals |
| `fiscal_year_end` | EODHD fundamentals |
| `other_listings` | EODHD fundamentals |
| `asset_class` | Auto-detected (Stocks/ETF/Funds/Crypto/Other) |

---

## Error Handling: Missing `ticker_eod`

When EODHD cannot find a match:

1. **Asset status** = `"error"` in enrichment result
2. **Error message** = `"No confident match found"`
3. **Employee action**:
   - Manually search for correct ticker
   - Use manual override: call enrich API with `ticker_override`
   
   ```json
   POST /api/portfolio-assets/enrich
   {
     "mode": "single",
     "asset_id": "<uuid>",
     "ticker_override": "SYMBOL.EXCHANGE"
   }
   ```

4. **Common causes**:
   - Misspelled stock name
   - Stock not in EODHD database (private, delisted, etc.)
   - Non-standard asset (fixed deposits, private equity)
   - **EODHD data incomplete** - some tickers have no fundamentals (description, officers, website)

> [!WARNING]
> **EODHD Data Limitations**: Some tickers (e.g., Hafnia Limited/HAFNI.US, Genting Singapore/G13.SI) return errors or empty data from EODHD. This is a data provider limitation, not a code issue. These assets will have `ticker_eod` but missing fundamentals.

---

## Manual vs Automatic Steps

| Step | Manual | Automatic |
|------|--------|-----------|
| Create customer | ✅ | - |
| Create investor profile | ✅ | - |
| Enter stock names | ✅ | - |
| Upload document | ✅ | - |
| Extract from PDF | - | ✅ (AI) |
| Bulk insert | - | ✅ |
| EODHD search | - | ✅ |
| Populate fundamentals | - | ✅ |
| Review failed matches | ✅ | - |
| Apply ticker override | ✅ | - |
| Mark as reviewed | ✅ | - |

---

## API Endpoints Reference

| Endpoint | Purpose | Payload |
|----------|---------|---------|
| `POST /api/portfolio-assets` | Insert single/multiple | `{ assets: [...] }` |
| `POST /api/portfolio-assets/bulk` | Bulk insert with auto-enrich | `{ portfolio_id, assets, auto_enrich }` |
| `POST /api/portfolio-assets/enrich` | Enrich assets | `{ mode, portfolio_id, asset_id, ticker_override }` |
| `POST /api/portfolio-assets/extract` | AI extraction | `FormData: file` |
| `DELETE /api/portfolio-assets/[id]` | Delete asset | - |
| `POST /api/portfolio-assets/[id]/mark-reviewed` | Mark reviewed | `{ reviewed_by }` |

---

## Gap Assessment

### ✅ Currently Working

- Manual asset entry
- PDF/Screenshot extraction via AI
- Single/portfolio/company/customer enrichment
- Ticker override for failed matches
- Mark as reviewed workflow

### ⚠️ Partial / Needs Improvement

| Gap | Status | Priority |
|-----|--------|----------|
| Failed match notification | Implemented (Toast) | 🟢 Low |
| Bulk review UI | Implemented (Filter) | 🟢 Low |
| Logo population | Not always populated by EODHD | 🟢 Low |

### ❌ Missing Features

| Gap | Impact | Priority |
|-----|--------|----------|
| Automatic retry for failed enrichment | Manual retry required | 🟡 Medium |
| Duplicate detection | Can insert same asset twice | 🟡 Medium |
| Asset import from broker API | Manual entry only | 🔴 High (future) |
| Real-time price sync | No live prices | 🟢 Low |

---

## Quick Start Checklist

1. [ ] Verify customer exists (`customer_basic_info`)
2. [ ] Create investor profile with `portfolio_id`
3. [ ] Choose input method:
   - [ ] Manual entry
   - [ ] PDF upload
   - [ ] CSV import
4. [ ] Confirm all assets inserted
5. [ ] Verify enrichment completed
6. [ ] Review any failed matches
7. [ ] Apply ticker overrides if needed
8. [ ] Mark portfolio as reviewed
