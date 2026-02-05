# Investment DNA & Onboarding

## The "Visual Sliders" Concept
Instead of manual text entry, customers define their profile via "Sliders" in the Web App (Lovable) during onboarding. This data directly populates the `investor_profiles` table.

## Core Variables (The DNA)

These variables control the "Voice" and "Focus" of the AI.

### 1. Data Granularity (`data_granularity`)
- **Type**: 1-5 Scale.
- **Low (1-2)**: "Big Picture". No decimals. Rounded prices.
- **High (4-5)**: "Analyst Mode". Exact EPS, basis points, detailed table reading.

### 2. Action Frequency (`action_frequency`)
- **Type**: 1-5 Scale.
- **Low (1-2)**: "Long-term Observer". Ignore <3% volatility. No day-trading CTA.
- **High (4-5)**: "Active Trader". Identify immediate entry/exit. Urgent language.

### 3. Risk Appetite (`risk_appetite`)
- **Type**: 1-5 Scale (Conservative - Aggressive).
- **Impact**: Determines asset allocation suggestions and "Warning" thresholds.

### 4. Decision Logic (`decision_logic`)
- **Type**: 1-5 Scale (Emotional/Story - Rational/Logic).
- **Rational (5)**: "If A then B". "Because...". Avoid hype.

### 5. Buy Box Triggers (`buy_box_trigger_n`)
- **Type**: Text / Multi-select options.
- **Examples**:
    - "Quality Pullback (>25% from High)"
    - "Earnings Dislocation"
    - "System Break Alarm"

### 6. Noise Filter (`noise_filter`)
- **Type**: Text / Negative Constraints.
- **Example**: "Ignore Macro-Economics. Ignore Political Gossip."

## Onboarding Process (Professionalized)
1. **Data Ingestion**: User sends Excel/PDF.
2. **AI Parsing**: **Firecrawl** / Parser-Bot (n8n) extracts Tiker/ISIN -> Supabase.
3. **Profile Setup**: User adjusts Sliders -> Investment DNA saved.
4. **Result**: A "Single-Workflow-System" ready to execute based on ID.
