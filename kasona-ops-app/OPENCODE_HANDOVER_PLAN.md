# OpenCode Handover Plan: Video Review Fixes & Improvements

> **Generated:** 2026-02-09
> **Source:** User Video Review (Transcript)
> **Goal:** Execute 30+ fixes and improvements across the Kasona Ops application.

---

## 📋 Executive Summary

This document outlines **6 Workstreams** of tasks identified in a comprehensive video review.
These tasks range from **Critical Bugs** (Priority 1) to **UI/UX Polish** (Priority 2/3).

**Agents/Developers:** You can execute these workstreams in parallel.
**Critical:** Follow the **UI/UX Design Guidelines** at the bottom of this document.

---

## 💾 Database Schema Changes (Required)

The following schema changes are required to support the new features.
Run these migrations **before** working on the respective components.

### 1. New Table: `kasona_tasks` (Workstream 6)

Replaces local JSON tasks with Supabase-backed tasks.

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
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. New Table: `kasona_customer_links` (Workstream 2)

For storing external resources (SharePoint, LinkedIn, etc.).

```sql
CREATE TABLE kasona_customer_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id INT REFERENCES kasona_customer_basic_info(company_id),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  link_type TEXT CHECK (link_type IN ('folder', 'document', 'website', 'linkedin', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT REFERENCES kasona_team_members(member_id)
);
```

### 3. Updates to `kasona_customer_basic_info` (Workstream 2)

```sql
ALTER TABLE kasona_customer_basic_info
ADD COLUMN tokens_processed INT DEFAULT 0;
-- Note: 'billing_email' already exists, ensure it is used.
```

---

## 🛠️ Workstream 1: Critical Bugs 🚨

**Focus:** Blocking issues that prevent core usage.

### 1.1 Duplicate Check Bug [01:14]

- **File:** `components/admin/crm/customer-manager.tsx`
- **Issue:** Selecting an existing lead from the "Duplicate Found" list either re-enables the check loop or fails to load the profile data correctly.
- **Fix:**
  - Locate `isDuplicate` logic and the interaction handler for the duplicate warning.
  - Ensure selecting a duplicate **bypasses** the create flow and **loads** the existing `company_id` into the edit form.
  - State `mode` should switch to `'edit'`.

### 1.2 Customer ID Generation [05:51]

- **File:** `components/admin/crm/customer-manager.tsx`
- **Issue:** Customer ID is not auto-generating / rules are wrong.
- **Fix:**
  - Verify `handleSubmit` does **not** try to generate a `company_id` client-side.
  - Let Supabase `SERIAL` / auto-increment handle it on INSERT.
  - Return the new `company_id` from the API response and update local state.

### 1.3 Hidden Save Button (Finance) [08:49]

- **File:** `components/admin/crm/company-profile.tsx` (Finance Section)
- **Issue:** "Save" button in Billing Address section is hidden (overflow issue) or unclickable (z-index).
- **Fix:**
  - Inspect the Billing Address container.
  - Fix CSS `overflow`, `height`, or `z-index` properties to ensure the Save button is fully visible and interactive.

### 1.4 Portfolio Import Failure [19:24]

- **File:** `components/admin/crm/portfolio-import-dialog.tsx`
- **Issue:** Clicking "Confirm and Import" during PDF/Screenshot upload results in an error.
- **Fix:**
  - Add error logging to `handleImport`.
  - Verify the `/api/portfolio/import` endpoint correctly handles `multipart/form-data` or JSON payload for file assets.
  - Ensure `Content-Type` headers are correct.

### 1.5 Sales Filter Reset [21:30]

- **File:** `components/admin/sales/sales-filters.tsx`
- **Issue:** "Reset Filter" button does nothing.
- **Fix:**
  - Wire up the `onClick` handler to clear all local filter state (`setFilters({})`) and reload the data.

### 1.6 Task Status Data Source [26:24]

- **File:** `components/admin/tasks/task-manager.tsx`
- **Issue:** Task view incorrectly displays "Action Status" (Customer entity) instead of "Task Status" (Task entity).
- **Fix:**
  - Refactor `TaskRow` to display `task.status` (todo/in_progress/done).
  - Ensure the API fetch joins the correct data but prefers Task table fields for the status column.

---

## 🛠️ Workstream 2: Customer Profile (UX)

**Focus:** Enhancing the Customer Detail View.

### 2.1 Empty Profile State [01:56]

- **File:** `components/admin/crm/company-profile.tsx`
- **Task:** Improve visual design when profile data is empty.
- **Fix:** Use a "Skeleton" or "Empty Placeholder" state that encourages filling data, rather than showing a broken/empty standard form.

### 2.2 Default Statuses [03:28]

- **File:** `components/admin/crm/customer-manager.tsx` (`EMPTY_STATE`)
- **Task:** Set sensible defaults.
- **Fix:**
  - `status` default: `"Lead Identified"`
  - `action_status` default: `"New"`
  - `type` default: `"customer"`

### 2.3 External Links Section [06:05]

- **File:** `components/admin/crm/customer-links-section.tsx` (New Component)
- **Task:** Add section for SharePoint, LinkedIn, Website links.
- **Fix:**
  - Create UI list of links.
  - fetching from `kasona_customer_links`.
  - "Add Link" button + Dialog.

### 2.4 Token Tracking [09:26]

- **File:** `components/admin/crm/customers-overview-stats.tsx`
- **Task:** Display "Tokens Processed" per customer.
- **Fix:** Render the `tokens_processed` count from `kasona_customer_basic_info`.

### 2.5 Edit Sales Data [10:34]

- **File:** `components/admin/crm/company-profile.tsx`
- **Task:** Allow editing Sales data (Deal Value, Probability) directly from Profile view.
- **Fix:** Add "Edit" pencil icon to Sales section headers → opens `CompanyProfileEditDialog` pre-filtered to Sales tab.

---

## 🛠️ Workstream 3: Finance & Contracts

**Focus:** Data entry improvements.

### 3.1 Field Reorganization [05:04]

- **File:** `components/admin/crm/company-profile.tsx`
- **Task:** Move fields.
- **Fix:** Move "Expected Deal Value" and "Probability" **out** of Finance section and **into** Sales section.

### 3.2 Dropdowns Over Text Inputs [07:34]

- **File:** `components/admin/crm/customer-manager.tsx`
- **Task:** Replace text inputs with Select dropdowns.
- **Fix:**
  - `charge_type`: ['Retainer', 'Per Hour', 'Package', 'Fixed Fee']
  - `billing_type`: ['Quarterly', 'Monthly', 'Project-based', 'Per Output']

### 3.3 Billing Email Default [07:54]

- **File:** `components/admin/crm/customer-manager.tsx`
- **Task:** Auto-fill Billing Email.
- **Fix:** When `email` (Main Contact) is entered, auto-copy to `billing_email` if empty.

### 3.4 Contract Dates [08:13]

- **File:** `components/admin/crm/customer-manager.tsx`
- **Task:** Fix Date Pickers.
- **Fix:**
  - Verify `DatePicker` component works for `start_date` and `end_date`.
  - Make `end_date` **optional** (allow null/clearing).

---

## 🛠️ Workstream 4: Sales Module

**Focus:** Sales process logic.

### 4.1 Product Type Logic [03:57]

- **File:** `components/admin/crm/customer-manager.tsx`
- **Task:** Update Options.
- **Fix:**
  - Rename "Consulting Project" → "**Transformation Packet**"
  - Rename "Free User" → "**Market Compass**"
  - Remove/Update "Wealth Intelligence" logic as requested.

### 4.2 Communication Features [22:08]

- **File:** `app/(admin)/sales/page.tsx`
- **Task:** Add "Email" button.
- **Fix:** Add a generic "Send Email" action button to Sales rows that opens `mailto:` with the customer email.

---

## 🛠️ Workstream 5: Investor Profile & Portfolio

**Focus:** Asset management.

### 5.1 Optional Fields [18:10]

- **File:** `components/admin/crm/portfolio-import-dialog.tsx`
- **Task:** Visual cues.
- **Fix:** Mark "Shares" and "Average Cost" as **(Optional)** in the UI label.

### 5.2 Mandatory Fields [18:25]

- **File:** `components/admin/crm/portfolio-import-dialog.tsx`
- **Task:** Validation.
- **Fix:** Remove `required` attribute from all fields **except** "Company Name" and "Portfolio ID".

### 5.3 Subscription Toggle [19:53]

- **File:** `components/admin/crm/investor-profile-form.tsx`
- **Task:** Add checkbox.
- **Fix:** Ensure `subscribed_portfolio_briefing` boolean toggle is visible in the form.

### 5.4 Quick Add Investor Profile [25:07]

- **File:** `app/(admin)/customers/page.tsx`
- **Task:** Shortcut.
- **Fix:** Add "Add Investor Profile" button to the Customers table row actions (or `QuickActionButton`). It should open `InvestorProfileForm` pre-filled with that customer.

### 5.5 Visual Import Refinement (Gemini) [16:03]

- **File:** `lib/gemini.ts` / `portfolio-import-dialog.tsx`
- **Task:** Improve parsing.
- **Fix:** Review the prompt sent to Gemini/LLM for PDF/Screenshot parsing. Ensure it maps "Quantity" to `shares` and "Cost Basis" to `avg_cost`.

---

## 🛠️ Workstream 6: Operations & Tasks

**Focus:** Workflow efficiency.

### 6.1 Status Change [22:49]

- **File:** `app/(admin)/operations/page.tsx`
- **Task:** Inline status edit.
- **Fix:** Replace text status in table with a `<Select>` or `<DropdownMenu>` to update status directly.

### 6.2 QA Checklist [23:21]

- **File:** `components/admin/operations/qa-checklist.tsx` (New)
- **Task:** Podcast review checklist.
- **Fix:** Simple checklist popup: "Audio checked", "Show notes complete", "Links verified".

### 6.3 Dynamic Action Button [23:52]

- **File:** `app/(admin)/operations/page.tsx`
- **Task:** Button state machine.
- **Fix:**
  - If status = 'To Create' → Show "Generate Podcast"
  - If status = 'Created' → Show "Review Podcast" (Link)
  - If status = 'Reviewed' → Show "Send Podcast"

### 6.4 Mark As Done [25:36]

- **File:** `components/admin/tasks/task-manager.tsx`
- **Task:** UI Check.
- **Fix:** Ensure clicking the checkbox visual clearly marks it as done (strikethrough/opacity) and updates DB.

### 6.5 Task Assignment Fields [25:56]

- **File:** `components/admin/tasks/task-manager.tsx`
- **Task:** Form completeness.
- **Fix:** Add fields to Task creation form:
  - **Category**: Sales, Finance, etc.
  - **Product**: Dropdown
  - **Priority**: Low/Medium/High
  - **Date**: DatePicker

### 6.6 Upcoming Tasks [26:37]

- **File:** `components/admin/tasks/task-manager.tsx`
- **Task:** Filter logic.
- **Fix:** Ensure "Upcoming" view filters where `due_date >= today` and sorts ascending.
