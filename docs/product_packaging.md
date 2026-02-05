# Product Packaging & Dashboard

## The "Wealth Intelligence Setup"
The customer buys a setup system for better decision making, not just software.

![Product Palette Overview](docs/assets/product_palette.png)
*(Reference Placeholders: 1_Lead Magnet, 2_Premium Tool, 3_Portfolio Briefing, 4_Core, 5_Core, 6_Analysis)*

## Product Tiering

| Customer Persona | Portfolio Briefing | Wealth App (Compass + Chatbot) | Body Language Analysis | NotebookLM Setup | Price |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Professional Investor** | ✅ TRUE | ✅ TRUE | ✅ TRUE | ✅ TRUE | € 8,000 Setup + € 500/mo |
| **Wealthy Part-Time** | ✅ TRUE | ✅ TRUE | ✅ TRUE | ❌ FALSE | € 500/mo |
| **Passive Investor** | ✅ TRUE | ❌ FALSE | ❌ FALSE | ❌ FALSE | € 100/mo |

---

## Dashboard Components (Lovable App)

### 1. Dashboard Home
- **Account Setup**: User logs in (Beta).
- **Overview**: High-level portfolio view.

### 2. The Real-Time Analyst (Telegram Bot)
- **Function**: Connects portfolio to Kasona-Bot.
- **Usage**: Ad-hoc analysis requests.

### 3. The Intelligence Suite (NotebookLM)
- **Function**: Dedicated Notebooks for Top 5-20 positions.
- **Source**: Live sources (Annual Reports, Earnings Calls).
- **Output**: Deep Dives.

---

## "Single-Workflow-System" Concept
We build `n8n` workflows so that we only change the **Customer ID** trigger. The system then automatically pulls:
1. **Portfolio** (via Supabase/App/Sheet).
2. **Investor Profile** (Variables & Sliders).
3. **Rhythm & Format** (Podcast vs Newsletter).
