# Feature Improvements - Multi-Agent Handover Plan

> **Date:** 2026-02-08  
> **Status:** Implemented + QA Verified  
> **Prepared for:** OpenCode / Multi-Agent Parallel Execution

## Overview

This plan addresses 4 major areas based on user observations. **Each workstream is independent** and can be assigned to different agents.

---

## Workstreams (Parallelizable)

| Workstream | Focus | Effort | Key Changes |
|------------|-------|--------|-------------|
| **A** | Onboarding & Import | 4-6h | Fix CSV/PDF upload, add shares/avg_cost columns |
| **B** | Customer Detail View | 6-8h | Edit buttons, anchor nav, portfolio table, links |
| **C** | Tasks System | 8-10h | New `kasona_tasks` table, owner dropdown, filters |
| **D** | Sales Page | 4-6h | Filters, search, inline status change |

---

## Workstream A: Onboarding & Import

### Issues to Fix
1. CSV files not selectable in file picker
2. PDF upload fails with Content-Type error
3. Add `shares` & `avg_cost` to `kasona_portfolio_assets`
4. Add `category` to manual entry form
5. Search customers by contact person name (not just company)

### Files to Modify
- `components/admin/crm/portfolio-import-dialog.tsx` - Fix file types, form fields
- `components/admin/onboarding/customer-onboarding.tsx` - Dual search
- `database/migrations/add_shares_avg_cost_columns.sql` - NEW migration

---

## Workstream B: Customer Detail View

### Issues to Fix
1. Move "Open all portfolios" to Portfolio Assets section
2. Create editable portfolio table view
3. Make Investor Profile edit button functional
4. Subnavigation scrolls to section anchors
5. Add edit for Company Overview & Finance Snapshot
6. Create Customer Links section
7. Show all contact persons

### Files to Modify
- `components/admin/crm/customer-profile-hub.tsx` - Major enhancements
- `components/admin/crm/portfolio-edit-dialog.tsx` - NEW
- `components/admin/crm/customer-links-section.tsx` - NEW

---

## Workstream C: Tasks System

### Issues to Fix
1. Create `kasona_tasks` table (replace local JSON)
2. Add `category` field (sales/finance/fulfillment/product/team)
3. Add owner dropdown from `kasona_team_members`
4. Filter tasks by team member
5. Show category-filtered tasks on department pages

### Files to Modify
- `database/migrations/create_kasona_tasks_table.sql` - NEW
- `components/admin/tasks/task-manager.tsx` - Supabase integration
- `app/(admin)/tasks/page.tsx` - Filters, server data fetch
- `lib/data/tasks.ts` - NEW data layer

---

## Workstream D: Sales Page

### Issues to Fix
1. Add filters (product, status, type, owner)
2. Add customer/contact search
3. Enable inline status change
4. Show customer-related tasks

### Files to Modify
- `app/(admin)/sales/page.tsx` - Filters, search, status dropdown
- `components/admin/sales/sales-filters.tsx` - NEW
- `lib/data/sales.ts` - Add filter support, updateStatus()

---

## Schema Changes Required

> ✅ **Decisions Finalized** (2026-02-08)

### 1. Add to `kasona_portfolio_assets`
```sql
ALTER TABLE kasona_portfolio_assets
ADD COLUMN shares NUMERIC(18,6) NULL,
ADD COLUMN avg_cost NUMERIC(18,6) NULL;
```

### 2. New `kasona_tasks` table
```sql
CREATE TABLE kasona_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id INT REFERENCES kasona_customer_basic_info(company_id),
  owner_id TEXT REFERENCES kasona_team_members(member_id),
  creator_id TEXT REFERENCES kasona_team_members(member_id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('todo', 'in_progress', 'blocked', 'done')) DEFAULT 'todo',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  category TEXT CHECK (category IN ('sales', 'finance', 'fulfillment', 'product', 'team', 'general')),
  due_date DATE,
  reminder_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  source TEXT CHECK (source IN ('manual', 'automation', 'system')) DEFAULT 'manual',
  related_entity_type TEXT,
  related_entity_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. New `kasona_customer_links` table
```sql
CREATE TABLE kasona_customer_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id INT REFERENCES kasona_customer_basic_info(company_id),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  link_type TEXT CHECK (link_type IN ('folder', 'document', 'website', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT REFERENCES kasona_team_members(member_id)
);
```

---

## Verification Checklist

- [x] CSV files selectable in import dialog
- [x] PDF upload works without Content-Type error
- [x] shares/avg_cost columns in manual entry (optional)
- [x] Customer search works on contact person name
- [x] "Open all portfolios" in correct location
- [x] Portfolio edit table works
- [x] Investor Profile edit is functional
- [x] Subnavigation scrolls to anchors
- [x] Tasks use Supabase table
- [x] Task owner dropdown works
- [x] Task category filter works
- [x] Sales filters work
- [x] Sales search works
- [x] Inline status change updates Supabase

---

## Execution Notes (2026-02-08)

- Workstream A delivered in onboarding/import flows and extraction API compatibility.
- Workstream B delivered in customer profile editability, section anchors, links, and contact persons.
- Workstream C delivered with Supabase-backed `kasona_tasks`, owner filters, category propagation.
- Workstream D delivered with sales filter/search controls and inline status updates.
- Build + type validation passed (`npx tsc --noEmit`, `npm run build`).

**Full detailed plan:** See `implementation_plan.md` in artifacts folder.
