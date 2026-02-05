# Investor Profiles & Persona Logic

This document defines the specific logic for different Investor Personas. This logic feeds into the System Prompts for the AI agents.

## 1. Persona Definitions

### Professional Investor (Daily)
- **Activity**: Active, Rational Capital Allocator.
- **Goal**: Alpha through information & reaction advantage.
- **Style**: "If A happens, then B" - without emotion.
- **Content Config**:
    - Output: Newsletter (Daily)
    - Data Granularity: 5 (High precision)
    - Action Frequency: 5 (Immediate)
    - Decision Logic: 5 (Rational)
- **Buy Box Trigger**:
    - *Earnings Dislocation*: EPS deviation > ±5% AND Guidance Change. Focus: Repricing events within 24-72h.

### Wealthy Part-Time Investor
- **Activity**: Weekly Check-in.
- **Goal**: Preserve wealth and increase intelligently. "Fewer well-understood decisions beat permanent activity."
- **Style**: Quality focused.
- **Content Config**:
    - Output: Podcast (Weekly)
    - Actions: 3
    - Data Granularity: 3
- **Buy Box Trigger**:
    - *Quality-Pullback*: Quality stock > 25% under High, ROIC stable > 15%, no structural break.
    - *Earnings Rule*: Only report if Guidance changed. Ignore "missed by 1 cent".

### Passive Investor
- **Activity**: Monthly.
- **Goal**: Avoid mistakes, accept market returns. avoid existential risks.
- **Style**: Passive, defensive.
- **Content Config**:
    - Output: Newsletter (Monthly)
    - Data Granularity: 1 (Trend only)
    - Action Frequency: 1 (Low)
- **Buy Box Trigger**:
    - *System Break Alarm*: Events with structural long-term impact (War, Currency Reform).

---

## 2. AI Logic Mapping

The following scales modify the System Prompt for `n8n` workflows.

### Data Granularity (1-5)
| Level | System Instruction |
|-------|-------------------|
| **1-2** | "Do not mention decimal places. Round prices. Focus on rough trend and 'Big Picture'. Do not read tables." |
| **4-5** | "Mention exact EPS numbers, margin changes in basis points, and exact price targets." |

### Action Frequency (1-5)
| Level | System Instruction |
|-------|-------------------|
| **1-2** | "Avoid Call-to-Action for Day-Trading. Formulate news as 'Observation for long-term trend'. Ignore short-term Vola (<3%)." |
| **4-5** | "Identify immediate entry opportunities. Use urgent language ('Act now')." |

### Decision Logic (1-5)
| Level | System Instruction |
|-------|-------------------|
| **4-5** | "Argue logically: If A, then B. Use 'Because' sentences. Avoid Hype language." |

---

## 3. Noise Filter (Negative Constraints)

Global Instructions for things the AI must **IGNORE**.

- **Example**: "Ignore Macro-Economic forecasts and short-term mood swings. Focus: Founded analysis of Balance Sheet and Business Model."

## 4. Specific Product Subscriptions

- **2.1.1.1**: Quartals (Quarterly updates)
- **2.1.1.2**: Stock Chatbot
- **2.1.1.3**: Portfolio Briefing
- **2.1.1.4**: Investment Analysis
- **2.1.1.5**: Deep Research (NotebookLM)
- **2.1.1.6**: Body Language Analysis
