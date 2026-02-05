# Automation Rules & Logic

## Legend
- 👤 **User:** The Customer/Lead.
- 🤖 **AI/Auto:** Missive Rules, Backend Automation, Content-Funnels.
- 👨💼 **Human:** Jakob/Team (High-Value Touchpoints).

---

## Core Rules

| **Rule / Automation Name** | **Trigger Condition** | **Actions (The "Machine")** |
| :--- | :--- | :--- |
| **1. Inbound Intelligence** | Incoming Msg from Lead OR Cal-Invite | • **Move to:** `Sales Inbox`<br>• **Apply Label:** `🔥 Interested`<br>• **Trigger Integration:** "Fetch User Profile" (Effect: Posts context/history in Chat window so Jakob doesn't search). |
| **2. Post-Call Draft** | Meeting ends (via Cal Integration) | • **OpenAI Integration:** Analyze Transcript.<br>• **Action:** "Draft Follow-Up Email" (Saves as Draft in Conversation).<br>• **Content:** Summary + relevant Asset Link (Portfolio Briefing). |
| **3. Command: /won** | Comment contains `/won` | • **Remove:** `🔥 Interested`<br>• **Add:** `✅ Won`<br>• **Webhook:** Send payload to Backend (Start Onboarding, Stripe Link, Account Creation).<br>• **Archive** Conversation. |
| **4. Command: /lost** | Comment contains `/lost` | • **Remove:** All active labels<br>• **Add:** `🚫 Lost`<br>• **Archive** Conversation. |
| **5. Nudge / Follow-Up** | Label `⏳ Procurement` set > 2 days | • **Move to:** Inbox<br>• **Add Comment:** "Time to follow up?" |

---

## Detailed Flows

### The "Pre-Touch" Intelligence Scan
*Status Quo:* Manual list scanning.
*Optimized (powered by Firecrawl):*
1. **🤖 AI Scan**: Uses **Firecrawl** to scan Waiting List + LinkedIn/Company News.
2. **Output**: Internal comment in Missive: *"Lead Score: High. Reason: Posted about Asset Class X. Angle: Podcast Episode 4."*
3. **👨💼 Human Validation**: Checks "Go/No-Go".

### The "Outreach" Trigger
1. **🤖 AI Drafting**: Drafts Missive email based on context. *"Use context X, mention Podcast Y, keep under 50 words."*
2. **👨💼 Human Action**: Reviews and hits "Send" (or slight edit).
3. **👤 User Experience**: Receives highly relevant mail, not mass spam.

### The "Instant" Follow-Up (Magic Moment)
1. **🤖 AI Agent**: Logic runs immediately after call ends.
2. **Action**: Creates Missive Draft with summary + correct Attachment/Link.
3. **👨💼 Employee**: Exits call -> Opens Missive -> Sees perfect draft -> Sends.
4. **Benefit**: User gets materials while the convo is fresh.

### Deal Moving (Slash Command)
- **Actor**: Employee uses `/won` or `/procurement`.
- **Backend Trigger**:
    - Account Creation.
    - Send Onboarding Material.
    - Generate Proposal if needed.
    - Notify "Customer Success": *"New User [Name], Focus [Topic]. Handover from Jakob."*
