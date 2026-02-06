# Telegram Bot Integration Plan

> Team collaboration and monitoring via Telegram bots and groups

---

## Overview

**Goal**: Set up Telegram infrastructure for team communication, AI agent interaction, and activity monitoring
**Components**: Multiple bots for different purposes, dedicated group channels

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     TELEGRAM INFRASTRUCTURE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐        │
│  │ Kasona Bot  │     │ Monitor Bot │     │ Alerts Bot  │        │
│  │ (AI Agent)  │     │ (Read-only) │     │ (Notify)    │        │
│  └──────┬──────┘     └──────┬──────┘     └──────┬──────┘        │
│         │                   │                   │                │
│         ▼                   ▼                   ▼                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    TELEGRAM GROUPS                          ││
│  ├─────────────┬─────────────┬─────────────┬───────────────────┤│
│  │ #general    │ #sales      │ #ops        │ #customer-alerts  ││
│  │ Team chat   │ Pipeline    │ Fulfillment │ New signups       ││
│  └─────────────┴─────────────┴─────────────┴───────────────────┘│
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 KASONA OPS BACKEND                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │   │
│  │  │ Webhook  │  │ n8n      │  │ Supabase │               │   │
│  │  │ Handler  │──│ Workflows│──│ Triggers │               │   │
│  │  └──────────┘  └──────────┘  └──────────┘               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Bot Specifications

### 1. Kasona AI Bot (Conversational)

**Purpose**: Team can ask questions, get portfolio insights, trigger actions

**Features**:
- Query customer data ("Show me customer 261001 portfolio")
- Get market updates ("What's happening with AMZN today?")
- Trigger enrichment ("Enrich portfolio 261001-A")
- Generate briefings ("Create briefing for customer X")

**Commands**:
```
/customer <id>     - Show customer details
/portfolio <id>    - Show portfolio assets
/enrich <id>       - Trigger enrichment
/briefing <id>     - Generate portfolio briefing
/search <ticker>   - Search EODHD for ticker
/help              - List commands
```

**Technical Setup**:
```
1. Create bot via @BotFather
   - Name: Kasona AI
   - Username: kasona_ai_bot
   
2. Get bot token: BOT_TOKEN=xxx
   
3. Webhook endpoint: POST /api/telegram/webhook
   - Parse incoming messages
   - Route to appropriate handler
   - Reply with formatted response
```

---

### 2. Monitor Bot (Read-Only Listener)

**Purpose**: Observe group chats and extract action items, update CRM

**Features**:
- Read messages in designated groups
- Detect mentions of customers/deals
- Extract action items ("I'll follow up with X")
- Log to Supabase activity table

**Triggers**:
| Pattern | Action |
|---------|--------|
| "follow up with @customer" | Create task in CRM |
| "/won @customer" | Update status to Won |
| "/lost @customer" | Update status to Lost |
| "called @customer" | Log activity |

**Technical Setup**:
```
1. Create bot via @BotFather
   - Name: Kasona Monitor
   - Username: kasona_monitor_bot
   
2. Add bot to groups as admin (read messages permission)

3. Webhook: POST /api/telegram/monitor
   - Parse group messages
   - Check for patterns
   - Log to kasona_activities table
```

---

### 3. Alerts Bot (Outbound Notifications)

**Purpose**: Push notifications to specific channels

**Channels**:

| Channel | Alerts |
|---------|--------|
| #customer-alerts | New signup, churned customer |
| #sales-pipeline | Stage changes, deals won/lost |
| #ops-fulfillment | Production complete, QA needed |
| #system-alerts | Errors, failed enrichments |

**Notification Format**:
```
🎉 NEW CUSTOMER
━━━━━━━━━━━━━━━━
Company: Acme Corp
ID: 261045
Contact: john@acme.com
Product: Premium

[View in CRM](https://app.kasona.io/customers/261045)
```

**Technical Setup**:
```
1. Create bot via @BotFather
   - Name: Kasona Alerts
   - Username: kasona_alerts_bot
   
2. Create groups for each channel
   - Add bot as admin
   - Save chat_ids
   
3. API route: POST /api/telegram/notify
   {
     channel: "customer-alerts",
     type: "new_customer",
     data: { ... }
   }
```

---

## Implementation Plan

### Phase A: Infrastructure (2-3h)

1. **Create 3 bots** via @BotFather
2. **Create Telegram groups**:
   - Kasona General
   - Kasona Sales
   - Kasona Ops
   - Kasona Alerts (announcements only)
3. **Store credentials** in `.env`:
   ```
   TELEGRAM_BOT_TOKEN_AI=xxx
   TELEGRAM_BOT_TOKEN_MONITOR=xxx
   TELEGRAM_BOT_TOKEN_ALERTS=xxx
   TELEGRAM_CHAT_ID_GENERAL=xxx
   TELEGRAM_CHAT_ID_SALES=xxx
   TELEGRAM_CHAT_ID_OPS=xxx
   TELEGRAM_CHAT_ID_ALERTS=xxx
   ```

### Phase B: Webhook Handlers (4-6h)

**Files to create**:

```
the list tool/
├── app/api/telegram/
│   ├── webhook/route.ts       # AI bot incoming
│   ├── monitor/route.ts       # Monitor bot incoming
│   └── notify/route.ts        # Outbound notifications
├── lib/telegram/
│   ├── client.ts              # Telegram API wrapper
│   ├── formatters.ts          # Message formatting
│   └── handlers/
│       ├── customer.ts        # /customer command
│       ├── portfolio.ts       # /portfolio command
│       └── enrich.ts          # /enrich command
```

**Webhook route structure**:
```ts
// app/api/telegram/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleCommand } from '@/lib/telegram/handlers';

export async function POST(req: NextRequest) {
  const update = await req.json();
  
  if (update.message?.text?.startsWith('/')) {
    const [command, ...args] = update.message.text.split(' ');
    const response = await handleCommand(command, args, update.message);
    
    await sendTelegramMessage(update.message.chat.id, response);
  }
  
  return NextResponse.json({ ok: true });
}
```

### Phase C: Supabase Integration (2-3h)

1. **Database triggers** for notifications:
   ```sql
   -- Trigger on new customer
   CREATE FUNCTION notify_new_customer()
   RETURNS trigger AS $$
   BEGIN
     PERFORM net.http_post(
       'https://app.kasona.io/api/telegram/notify',
       jsonb_build_object(
         'channel', 'customer-alerts',
         'type', 'new_customer',
         'data', row_to_json(NEW)
       )
     );
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   
   CREATE TRIGGER on_new_customer
   AFTER INSERT ON kasona_customer_basic_info
   FOR EACH ROW EXECUTE FUNCTION notify_new_customer();
   ```

2. **Activity logging table**:
   ```sql
   CREATE TABLE kasona_activities (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     type text NOT NULL,
     actor text,
     company_id integer REFERENCES kasona_customer_basic_info(company_id),
     details jsonb,
     source text DEFAULT 'telegram',
     created_at timestamptz DEFAULT now()
   );
   ```

---

## n8n Alternative Approach

If using n8n for workflow automation:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Telegram    │────▶│    n8n      │────▶│  Supabase   │
│ Webhook     │     │  Workflow   │     │   Action    │
└─────────────┘     └─────────────┘     └─────────────┘
```

**n8n Webhook URL**: `https://n8n.kasona.io/webhook/telegram`

Workflow nodes:
1. Telegram Trigger
2. Parse Message
3. Route by Command
4. Execute Action (Supabase, EODHD, etc.)
5. Send Response back to Telegram

---

## Security Considerations

1. **Webhook verification**: Validate Telegram's secret token
2. **Rate limiting**: Prevent bot abuse
3. **Permission checks**: Only authorized users can trigger actions
4. **Sensitive data**: Don't expose customer PII in group chats

---

## Checklist

### Setup
- [ ] Create 3 Telegram bots
- [ ] Create 4 Telegram groups
- [ ] Add bots to groups with correct permissions
- [ ] Store chat IDs and tokens in .env

### Development
- [ ] Create `/api/telegram/webhook` endpoint
- [ ] Create `/api/telegram/notify` endpoint
- [ ] Implement command handlers
- [ ] Create message formatters

### Integration
- [ ] Add Supabase triggers for notifications
- [ ] Connect to n8n workflows (optional)
- [ ] Test all notification channels
