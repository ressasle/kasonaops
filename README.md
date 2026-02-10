# Kasona Ops

CRM & Operations tool for customer management and personalized portfolio briefing fulfillment. The CRM system does 1. customer management and sales for Kasona Ops


---

## 🤖 AI Agent Context (READ FIRST)

> **For OpenCode, Codex, or any AI coding agent working on this project.**

### Before You Start Coding

1. **Read the documentation** in `docs/` (NOT `docs/archive/` — those are obsolete)
2. **Check existing UI components** in `kasona-ops-app/components/ui/` before creating new ones
3. **Review the current task plan** in `kasona-ops-app/OPENCODE_HANDOVER_PLAN.md`

### Essential Files to Review

| Purpose                       | File                                            |
| ----------------------------- | ----------------------------------------------- |
| **Current Task Plan**   | `kasona-ops-app/OPENCODE_HANDOVER_PLAN.md`    |
| **Feature Sprint Plan** | `kasona-ops-app/FEATURE_IMPROVEMENTS_PLAN.md` |
| **Database Schema**     | `database/schema.sql`                         |
| **TypeScript Types**    | `kasona-ops-app/lib/database.types.ts`        |
| **Data Model SOP**      | `docs/sop_data_model.md`                      |
| **Style Guide**         | `docs/style_guide.md`                         |
| **Admin Styling**       | `docs/KASONA_ADMIN_STYLE.md`                  |

### Existing UI Components (Don't Recreate)

All base components are in `kasona-ops-app/components/ui/`:
`Alert`, `Badge`, `Button`, `Card`, `Dialog`, `DropdownMenu`, `Input`, `Label`, `Progress`, `ScrollArea`, `Select`, `Separator`, `Sidebar`, `Slider`, `Switch`, `Table`, `Tabs`, `Textarea`

Admin-specific components in `kasona-ops-app/components/admin/`:
`OwnerSelect` (for team member ownership dropdowns)

### Key Design Rules

- **Theme**: Glassmorphism + Dark Mode
- **Icons**: Lucide React only (NO emojis)
- **Cards**: `glass-panel rounded-2xl` class
- **Cursors**: `cursor-pointer` on all clickables
- **Colors**: Orange/Pink gradient accents

### DO NOT

- ❌ Read from `docs/archive/` (obsolete)
- ❌ Create UI components that already exist
- ❌ Use emojis as icons
- ❌ Guess at database schema

---

## Project Structure

```
Antigravity/
├── kasona-ops-app/          # Main Next.js application ⭐
│   ├── app/(admin)/         # Admin routes
│   ├── components/          # UI & admin components
│   ├── lib/                 # Data fetching, Supabase client
│   └── OPENCODE_HANDOVER_PLAN.md  # Current task plan
├── database/                # Schema & migrations
│   ├── schema.sql           # Source of truth
│   └── migrations/          # Applied migrations
├── docs/                    # All documentation ⭐
│   ├── project-setup/       # Data schemas, constitution
│   ├── style_guide.md       # Visual design system
│   ├── sop_*.md             # Standard operating procedures
│   └── archive/             # ⚠️ OBSOLETE - do not use
├── antigravity-trigger-dev-main/  # Trigger.dev integration
└── EODHD_MCP_server/        # External MCP tool
```

## Quick Start

```bash
cd kasona-ops-app
npm install
npm run dev
```

Application runs at `http://localhost:3000`

## Database

- **Schema**: `database/schema.sql` is the canonical source
- **Supabase Project**: Connected via environment variables in `.env.local`
- **TypeScript Types**: `kasona-ops-app/lib/database.types.ts`

### Applied Schema Changes (Feature Improvement Sprint)

- `kasona_portfolio_assets` now includes `shares`, `avg_cost` (`database/migrations/add_shares_avg_cost_columns.sql`)
- `kasona_tasks` added for task management (`database/migrations/create_kasona_tasks_table.sql`)
- `kasona_customer_links` added for external links per customer (`database/migrations/create_kasona_customer_links_table.sql`)

### Feature Improvement Sprint (A-D) Status

- Workstream A (Onboarding & Import): completed
- Workstream B (Customer Detail View): completed
- Workstream C (Tasks System): completed
- Workstream D (Sales Page): completed
- QA checklist and click-path verification: `docs/qa_feature_improvements_2026-02-08.md`

## Documentation Index

| Document                                                        | Purpose                                     |
| --------------------------------------------------------------- | ------------------------------------------- |
| [Data Schemas](docs/project-setup/gemini.md)                       | Supabase tables & schemas                   |
| [Data Model SOP](docs/sop_data_model.md)                           | Table relationships                         |
| [Portfolio Assets SOP](docs/sop_portfolio_assets.md)               | Portfolio ingestion flow                    |
| [Style Guide](docs/style_guide.md)                                 | Colors, typography, components              |
| [Admin Style](docs/KASONA_ADMIN_STYLE.md)                          | Admin panel specifics                       |
| [Operations Manual](docs/operations_manual.md)                     | Business processes                          |
| [Feature QA Checklist](docs/qa_feature_improvements_2026-02-08.md) | Click-path verification for workstreams A-D |
| [Finance Spec](docs/Finance_to-be-adapted.md)                      | Finance System Architecture & Schema        |
| [Finance QA Guide](docs/qa_finance_handover.md)                    | Testing steps for Finance System            |

made by Kasona for all
