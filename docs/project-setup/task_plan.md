# Task Plan

## Blueprint (Approved)
**North Star**: CRM/operations system to track customer stage and fulfill personalized podcast production by company/customer ID.

**Scope (Phase 1)**
- Operational CRM dashboard (Admin, Sales, Operations, Tracking, Tasks)
- Supabase-backed data model aligned to provided schema
- Local output payload for handover and preview

**Out of Scope (Phase 1)**
- Production automation triggers
- Full toolchain integrations (Missive/Gmail/ElevenLabs/PDF)

**Deliverables**
- Data schema defined in `gemini.md`
- SOP docs in `architecture/`
- Admin UI prototype (static) aligned to style guide
- Handover notes for Jakob

## Phases
- Initialization
- Blueprint
- Link
- Architect
- Stylize
- Trigger

## Goals
- Establish project requirements and data schema
- Validate integrations and credentials
- Implement deterministic tools and SOPs
- Deliver formatted payloads
- Deploy automation and document maintenance

## Checklists
### Initialization
- [x] Create project memory files
- [x] Capture discovery answers
- [x] Define data schema in gemini.md

### Blueprint
- [x] Confirm North Star outcome
- [x] Confirm integrations and keys
- [x] Confirm source of truth
- [x] Confirm delivery payload
- [x] Confirm behavioral rules

### Link (Next.js App Foundation)
- [x] Initialize Next.js project (`the list tool`)
- [x] **Dashboard Status**: Implement Real-time Dashboard in Next.js
    - [x] Display key metrics (Total Customers, Active Portfolios, MRR)
    - [x] Show recent activity feed
- [x] **Supabase Integration**:
    - [x] Install Supabase client
    - [x] Create Typescript interfaces from `schema.sql`

### Architect (Core Features)
- [x] **Manual Entry: Company Profile**
    - [x] Create `customer_basic_info` form (Company Name, Contact, Status, etc.)
    - [x] Implement validation and optimistic UI updates
- [x] **Manual Entry: Investor Profile**
    - [x] Create `investor_profiles` form linked to Company ID
    - [x] Implement DNA sliders (Risk, Granularity, etc.)
- [x] **Upload Features (Portfolio)**
    - [x] **CSV Upload**: Implement client-side CSV parsing for bulk asset creation.
    - [x] **Gemini PDF Extraction**: Build API route to extract holdings from PDF.
    - [x] UI: Create "Drop Zone" component with manual fallback.
- [ ] **Leads List Management**
    - [ ] View/Edit/Delete functionality for all tables
    - [ ] "One-Click" actions (e.g., "Create Portfolio from Lead")

### Stylize
- [ ] Apply "Kasona" Glassmorphism to all new forms
- [ ] Ensure mobile responsiveness

### Trigger
- [ ] Deploy automation
- [ ] Set up triggers
- [ ] Update maintenance log
