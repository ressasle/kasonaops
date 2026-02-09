# QA Checklist - Feature Improvements (A-D)

Date: 2026-02-08

Scope:
- Workstream A: Onboarding and Import
- Workstream B: Customer Detail View
- Workstream C: Tasks System
- Workstream D: Sales Page

Build and type checks:
- [x] `npx tsc --noEmit` passed
- [x] `npm run build` passed

---

## A. Onboarding and Import

1) CSV and mixed file picker
- Click path: `Onboarding` -> `Import Portfolio Assets` -> upload control
- Verify:
  - [x] Picker accepts `.csv,.pdf,.png,.jpg,.jpeg,.webp`
  - [x] Unsupported file types show validation error

2) PDF upload Content-Type handling
- Click path: upload PDF in onboarding portfolio flow
- Verify:
  - [x] Request uses multipart form upload
  - [x] API accepts multipart and JSON fallback
  - [x] No `Content-Type` mismatch failure

3) Manual asset fields
- Click path: onboarding portfolio step -> manual holding row
- Verify:
  - [x] `category` input exists
  - [x] `shares` and `avg_cost` persist in bulk save payload

4) Customer search by contact person
- Click path: onboarding step `Select Customer` -> search input
- Verify:
  - [x] search matches company name
  - [x] search matches email
  - [x] search matches contact person name

---

## B. Customer Detail View

1) Subnavigation anchors
- Click path: `Customers` -> open customer -> use sticky subnav buttons
- Verify:
  - [x] section buttons scroll to target anchors

2) Company and finance edit
- Click path: customer detail -> `Company Overview` edit, `Finance Snapshot` edit
- Verify:
  - [x] dialogs open and save through `/api/customers/[company_id]`

3) Investor profile edit
- Click path: customer detail -> `Investor Profiles` -> `Edit`
- Verify:
  - [x] profile update persists via `/api/investor-profiles/[portfolio_id]`

4) Portfolio controls and table edit
- Click path: customer detail -> `Portfolio Assets`
- Verify:
  - [x] `Open all portfolios` and `Open single` are in Portfolio section
  - [x] editable table dialog saves via `/api/portfolio-assets/[id]`

5) Contact persons and customer links
- Click path: customer detail -> `Contact Persons`, `Customer Links`
- Verify:
  - [x] all contact persons are rendered
  - [x] links can be added/deleted via `/api/customer-links`

---

## C. Tasks System

1) Supabase task table
- Verify:
  - [x] migration created: `database/migrations/create_kasona_tasks_table.sql`

2) Tasks page data and ownership
- Click path: `Tasks`
- Verify:
  - [x] tasks loaded from `kasona_tasks` (no local JSON)
  - [x] owner dropdown uses `kasona_team_members`
  - [x] owner filter works

3) Task CRUD and metadata
- Click path: `Tasks` -> create/edit status/delete
- Verify:
  - [x] create via `/api/tasks`
  - [x] update/delete via `/api/tasks/[id]`
  - [x] category + priority/status variants persisted

4) Department task visibility
- Click path: `Sales`, `Finance`, `Operations`
- Verify:
  - [x] category-filtered task cards render per department

---

## D. Sales Page

1) Filter and search controls
- Click path: `Sales` -> use filters and search
- Verify:
  - [x] filters for product/status/type/owner applied server-side
  - [x] company/contact/email search works

2) Inline status update
- Click path: `Sales` -> `List View` -> change status dropdown in row
- Verify:
  - [x] status updates through `/api/sales/[company_id]/status`
  - [x] row reflects updated status

3) Customer-related task visibility
- Click path: `Sales` -> list table
- Verify:
  - [x] per-customer open sales task count is shown

---

Known non-blocking note:
- Next.js warning during build: `experimental.typedRoutes` moved to `typedRoutes` in `next.config.mjs`.
