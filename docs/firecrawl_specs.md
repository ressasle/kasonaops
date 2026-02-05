# Firecrawl Integration Specifications

Firecrawl is the primary engine for web data extraction and enrichment across the Sales and Operations lifecycle.

## 1. Core Endpoints & Usage

### 🕵️ Scrape (Post-Call & Lead Detail)
- **Tool**: `/scrape`
- **Goal**: Extract specific information from a single URL (customer website, LinkedIn profile).
- **Format**: Markdown / Structured JSON.
- **Action Logic**:
    - Scrape LinkedIn profiles for "About" and "Recent Posts".
    - Store in `customer_basic_info.notes` or as a comment in Missive.

### 🕸️ Crawl (Pre-Touch Intelligence)
- **Tool**: `/crawl`
- **Goal**: Scrape entire subpages to find deeper context.
- **Usage**: Scan "News", "Press Releases", or "Investor Relations" pages of a lead's company.
- **Logic**: Identify recent mentions of "Asset Classes", "Dividends", or "Acquisitions" to generate the "Empfohlener Einstiegswinkel".

### 🔍 Search (Market Intelligence)
- **Tool**: `/search`
- **Goal**: Real-time lookup of market news or specific ticker events.
- **Usage**: n8n triggers search when a "Buy Box" condition is met to find confirming/refuting news.

---

## 2. Structured Extraction (Investment DNA)

Use Firecrawl's `extract` feature to populate table data:

- **Target**: PDF/Image extracts of Portfolios.
- **Schema**:
  ```json
  {
    "tickers": ["string"],
    "asset_class": ["string"],
    "isin": ["string"]
  }
  ```
- **Destination**: Supabase `portfolio_assets` table.

---

## 3. Workflow Triggers (n8n Integration)

1. **Lead Enrichment Trigger**:
   - Condition: New lead added to `2.1.1.1_waiting-list`.
   - Action: Firecrawl Scrape -> OpenAI Context Note -> Missive Comment.

2. **Portfolio Ingestion Trigger**:
   - Condition: Attachment received in Missive / Uploaded to Dashboard.
   - Action: Firecrawl Parse -> Supabase Insert.

3. **Daily News Watchdog**:
   - Condition: Daily Schedule.
   - Action: Firecrawl Search (Tickers in `portfolio_assets`) -> Noise Filter -> Telegram Alert.
