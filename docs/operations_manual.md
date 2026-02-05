# Operations Manual: High-Touch Investor Onboarding & Fulfillment

## Process Overview
This process describes the full lifecycle from **Lead Scouting** to **Premium Fulfillment**. The goal is to efficiently qualify leads, provide value ("Audio Sample") quickly, and convert them into paying customers.

---

## Phase 1: Lead Selection & Qualification
*Trigger: New Lead from Network, Waitlist, or Outbound.*

### 1. Lead Check (CRM Hygiene) 👤
- **Actor**: Sales (Jakob)
- **Tool**: Internal Tool / CRM
- **Action**: Check if contact exists.
    - *Check*: Is he already on the waitlist?
    - **🤖 AI Enrichment**: Uses **Firecrawl** to scan LinkedIn and company news for a "Context Note".

### 2. Contact Outreach 👤
- **Scenario A (Inbound/Waitlist)**: Lead has already expressed interest.
- **Scenario B (Cold/Network)**: Lead needs qualification.
- **Action**: Send email via **Missive**.
    - *Goal*: Invite to Onboarding or send "Audio Sample" (Teaser).
    - *Automation*: Status change in Missive triggers reminder sequence.

---

## Phase 2: Onboarding & Data Ingestion (Setup)
*Goal: Gather data to generate the product.*

### 1. Account Creation (Admin View) 👤
- **ID**: '261000...' generated automatically.
- **Actor**: Jakob creates User in Admin View.
- **Outcome**: `company_id` generated in Supabase.
- **Task**: Transfer customer data to central Google Sheet / Admin Section.

### 2. Investor Profiling 👤
- **Source**: [Investor Profile GSheet](https://docs.google.com/spreadsheets/d/1Wz6f1rqHOav1mQSSOXnaPJtWZnY3NnqJL0ew2vbwW48/edit?gid=1133178787#gid=1133178787)
- **Key Metrics**:
    - **Data Granularity (1-5)**:
        - *1-2*: No decimals, round prices, focus on "Big Picture".
        - *4-5*: Exact EPS numbers, margin changes in basis points.
    - **Action Frequency (1-5)**:
        - *1-2*: Avoid Day-Trading CTA. "Long-term trend observation".
        - *4-5*: Identify immediate entry chances. Urgent language.
    - **Decision Logic (1-5)**:
        - *4-5 (Rational/Simon)*: Logical argumentation. "If A, then B". Avoid hype.
- **Action Items**:
    - Define **Investment Philosophy** (Persona of AI).
    - Define **Noise Filter** (Negative Constraints - what to ignore).
    - Fill out Investor Profile (Risk, Anti-Goals, Time Horizon).

### 3. Portfolio Ingestion 👤 🤖
- **Pain Point**: Converting PDF/Excel depot statements to data.
- **Current Process**: Manual entry in Admin Panel/Google Sheet.
- **Important**: Check Ticker Suffixes (e.g., `BEI.DE`, `GIVN.SW`).
- **Target**: AI Parser reads PDF -> Supabase.
- **Trigger**: `n8n` workflow "Update Portfolio".
- **🤖 Tool**: **Firecrawl** for structured data extraction from web sources.

---

## Phase 3: Sales & Demo (The "Hook")

### 1. Presentation / Demo 👤
- **Option A (Low Touch)**: Send Loom Video (Guided Tour).
- **Option B (High Touch)**: Live Call (Zoom/Meet) -> **RECORD THIS!**
- **SOP: Live Demo Call**:
    1. [ ] Start Recording.
    2. [ ] Listen to "Audio Sample" together (1-2 min).
    3. [ ] Show Dashboard (Focus on solved pain points).
    4. [ ] Closing: "Shall we finalize this setup?" -> Stripe Link.

### 2. Closing 👤
- Sell License.
- **Upsell**: NotebookLM Setup (Deep Research Package).
    - Create Notebook for Top 5-20 positions.
    - Payment via Stripe.

---

## Phase 4: Service Generation & QA (The "Magic")

### 1. Production Run 🤖
- **Trigger**: "Portfolio Complete" or Weekly Schedule.
- **Action**: `n8n` Workflow starts.
- **Output**: Portfolio Briefing (Audio/Text) based on Supabase data.

### 2. Quality Assurance (QA) 👤
- Refer to "HEAD OF INVESTMENT - Customer Guide".

---

## Phase 5: Fulfillment & Premium Setup

### 1. Standard Fulfillment 🤖
- **Access**: Unlock Dashboard.
- **Telegram**: Send `Chat_ID` with instructions.

### 2. Onboarding & Handover 👤
- **Setup**: Create account in **Lovable App**.
- **Telegram**: Connect Bot with Portfolio, create Group.
- **Handover**: Send Voice Message/Loom in Group.
    - *Script*: "Hey [Name], your system is ready. Your Bot knows your 'Buy Box'..."

### 3. Premium Fulfillment (NotebookLM) 👤
- **Trigger**: "Deep Research" purchase.
- **SOP**:
    - Collect sources (Earnings Calls, PDFs).
    - Setup NotebookLM.
    - Generate Audio/Summary.
    - Handover with "Ultimate Prompt List".
