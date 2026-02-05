# Kasona Ops

CRM & Operations tool for customer management and personalized portfolio briefing fulfillment.

## Project Structure

```
Antigravity/
├── the list tool/           # Main Next.js application
├── database/                # Schema & migrations
│   ├── schema.sql           # Source of truth
│   └── migrations/          # Applied migrations
├── docs/                    # All documentation
│   ├── architecture/        # SOPs
│   ├── project-setup/       # Bootstrap & planning files
│   ├── design_inspo/        # Reference projects
│   └── archive/             # Obsolete prototypes
├── antigravity-trigger-dev-main/  # Trigger.dev integration
└── EODHD_MCP_server/        # External MCP tool
```

## Quick Start

```bash
cd "the list tool"
npm install
npm run dev
```

Application runs at `http://localhost:3000`

## Database

- **Schema**: `database/schema.sql` is the canonical source
- **Supabase Project**: Connected via environment variables in `.env.local`

## Documentation

- [Project Status](docs/project-setup/STATUS.md)
- [Data Schemas](docs/project-setup/gemini.md)
- [Architecture SOPs](docs/architecture/)
- [Style Guide](docs/style_guide.md)
