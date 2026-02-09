# OpenCode Handover Plan: App Enhancements

## Overview
This document provides a detailed implementation plan for two major feature sets:
- **Section B**: Team Section + Reminder Quick Action
- **Section C**: Customers Page UX Overhaul

---

# Section B: Team Section + Reminder Quick Action

## B.1 — Team Section & Member Profiles

### Context
- The `kasona_team_members` table **already exists** in Supabase with complete schema
- **No Team UI components exist yet** — must be built from scratch

### Database Schema (Already Exists)
```
kasona_team_members:
  - member_id: string (PK)
  - first_name, last_name, display_name, email, phone
  - avatar_url, date_of_birth, hire_date, termination_date
  - is_active: boolean
  - contract_type: 'full_time' | 'part_time' | 'freelancer' | 'working_student' | 'intern'
  - salary_gross, salary_currency, tax_id, social_security_id
  - street, city, postal_code, country, iban, bank_name
  - role: 'admin' | 'manager' | 'analyst' | 'assistant' | 'viewer'
  - department: 'management' | 'sales' | 'operations' | 'finance' | 'tech'
  - job_title, auth_user_id, notes
  - created_at, updated_at
```

### Files to Create

#### 1. [NEW] `app/(admin)/team/page.tsx`
- Team list page with grid/table of members
- Filter by department, role, active status
- Search by name/email
- Link each member card to their profile

#### 2. [NEW] `app/(admin)/team/[member_id]/page.tsx`
- Individual team member profile page
- Display all member info (personal, HR, role)
- Edit button → opens form
- Tabs: Overview | HR Details | Notes

#### 3. [NEW] `components/admin/team/team-manager.tsx`
- Main team list component
- Uses similar patterns to `CustomerManager`
- Grid of `TeamMemberCard` components
- "Add Team Member" button

#### 4. [NEW] `components/admin/team/team-member-card.tsx`
- Card showing avatar, name, role, department
- Quick actions: Email, View Profile
- Active/Inactive badge

#### 5. [NEW] `components/admin/team/team-member-form.tsx`
- Form for creating/editing team members
- Grouped sections: Personal Info, Contact, HR/Payroll, Role & Access
- Uses existing UI components (Input, Select, etc.)

#### 6. [NEW] `lib/data/team.ts`
- `getTeamMembers()` — fetch all active members
- `getTeamMember(id)` — fetch single member
- `createTeamMember(data)` — insert new member
- `updateTeamMember(id, data)` — update member

#### 7. [NEW] `app/api/team/route.ts`
- GET: List all team members
- POST: Create new team member

#### 8. [NEW] `app/api/team/[member_id]/route.ts`
- GET: Single member details
- PATCH: Update member
- DELETE: Soft-delete (set is_active = false)

### Files to Modify

#### 1. [MODIFY] `components/admin/admin-sidebar.tsx`
Add "Team" nav item after "Customers":
```tsx
{ label: "Team", href: "/team", icon: Users2 }
```
Import `Users2` from lucide-react.

---

## B.2 — "Set Reminder" Quick Action Button

### Context
- `QuickActionButton` component exists at `components/admin/quick-action-button.tsx`
- Has 3 actions: New Task, New Lead, New Onboarding
- `reminder_date` column exists in `kasona_customer_basic_info`
- `action_status` includes `'Reminder Set'` as valid enum

### Files to Create

#### 1. [NEW] `components/admin/reminder-dialog.tsx`
Dialog component for setting reminders:
- Customer selector (searchable dropdown)
- Date picker for `reminder_date`
- Optional notes field
- On submit: Updates customer's `reminder_date` and sets `action_status = 'Reminder Set'`

### Files to Modify

#### 1. [MODIFY] `components/admin/quick-action-button.tsx`
Add new menu item:
```tsx
<DropdownMenuItem onClick={() => setShowReminderDialog(true)} className="gap-2">
  <Bell className="h-4 w-4" />
  Set Reminder
</DropdownMenuItem>
```
- Import `Bell` from lucide-react
- Add state: `const [showReminderDialog, setShowReminderDialog] = useState(false)`
- Render `<ReminderDialog open={showReminderDialog} onOpenChange={setShowReminderDialog} />`

---

# Section C: Customers Page UX Overhaul

## C.1 — Separate "Add New" from "Edit/Review"

### Problem
Current `customers/page.tsx` displays `CustomerManager`, `InvestorProfileManager`, and `PortfolioAssetsManager` all on one page — mixing creation with review/editing.

### Solution
Refactor to tab-based navigation where "Add New" is a **separate route** or modal, not inline with the list.

### Files to Modify

#### 1. [MODIFY] `app/(admin)/customers/page.tsx`
- Remove inline form from `CustomerManager` — use it for **list/review only**
- Add prominent "Add Customer" button that links to `/customers/new`
- Keep the sub-navigation (Overview, Profiles, Assets) but conditionally show only the relevant manager

#### 2. [MODIFY] `components/admin/crm/customer-manager.tsx`
- Add new prop: `mode: 'list' | 'form'` (default: 'list')
- In 'list' mode: Show table + filters only, no inline form
- In 'form' mode (for `/customers/new`): Show form only
- Remove the "Add/Edit" toggle that currently exists inline

---

## C.2 — Fix Sub-Navigation Bar

### Problem
The sub-navigation buttons (Overview, Profiles, Assets) are present but clicking them doesn't properly isolate each view — all 3 managers always render.

### Files to Modify

#### 1. [MODIFY] `app/(admin)/customers/page.tsx`
Conditionally render based on `activeView`:
```tsx
{activeView === "overview" && (
  <CustomerManager customers={customers} supabaseReady={supabaseReady} mode="list" />
)}
{activeView === "profiles" && (
  <InvestorProfileManager profiles={profiles} supabaseReady={supabaseReady} />
)}
{activeView === "assets" && (
  <PortfolioAssetsManager assets={assets} supabaseReady={supabaseReady} />
)}
```

---

## C.2 — Add Overview Stats Section

### Requirements
Mirror the Dashboard stats at the top of the Customers page:
1. **Operations Queue** — link to `/operations`
2. **Total Customers** — count from Supabase
3. **Customers Assigned to Me** — filter by `owner_id` (requires auth context)

### Files to Create

#### 1. [NEW] `components/admin/crm/customers-overview-stats.tsx`
```tsx
interface Props {
  totalCustomers: number;
  assignedToMe: number;
  operationsQueue: { pending: number; waiting: number };
}
```
- Three stat cards similar to Dashboard
- Links to relevant sections

### Files to Modify

#### 1. [MODIFY] `app/(admin)/customers/page.tsx`
- Import and render `CustomersOverviewStats` above the sub-nav
- Pass computed stats from the fetched data

---

## C.2.a — Checklist Info Popup

### Requirement
Add a small transparent "ⓘ" icon that opens a popup showing checklists so employees can verify they completed all steps.

### Files to Create

#### 1. [NEW] `components/admin/crm/checklist-popup.tsx`
- Small icon button (Info icon from lucide)
- Opens a Popover or Dialog
- Displays customer-fulfillment checklist items (from data or hardcoded)
- Checkboxes for: Portfolio Uploaded, Profile Created, DNA Completed, Handover Delivered

### Files to Modify

#### 1. [MODIFY] `app/(admin)/customers/page.tsx` or `customer-manager.tsx`
- Add `<ChecklistPopup />` component near the page header

---

## C.2.b — Filter by Industry, Product, Type

### Current State
`CustomerManager` already has filter state for `industry`, `type`, but UI may be incomplete.

### Files to Modify

#### 1. [MODIFY] `components/admin/crm/customer-manager.tsx`
- Ensure filter dropdowns are visible and functional:
  - **Industry**: Investing, Industrial Services, Consulting, E-Commerce
  - **Type**: customer, partner, supplier, other
  - **Product**: Wealth Intelligence, Quartals-kompass, Transformations Paket
- Place filters in a dedicated filter bar below sub-nav

---

## C.2.c — Tasks Section for Fulfillment

### Requirement
Show tasks related to customer fulfillment based on `action_status` column. Also show reminders that have been set.

### Database Context
- `action_status` enum: 'Renewed', 'To Expand', 'Backlog', 'New', 'To Check', 'Reminder Set', 'To Reach Out', 'Mail Sent'
- `reminder_date` column holds scheduled reminder dates

### Files to Create

#### 1. [NEW] `components/admin/crm/fulfillment-tasks.tsx`
- List customers grouped by `action_status`
- Priority order: "Reminder Set" (show date), "To Check", "To Reach Out", etc.
- Quick action buttons to update status or mark complete

### Files to Modify

#### 1. [MODIFY] `app/(admin)/customers/page.tsx`
- Add new sub-nav tab: "Tasks"
- When `activeView === "tasks"`: render `<FulfillmentTasks />`

---

## C.2.d — Upcoming Customers View

### Requirement
Show customers based on `start_date` — upcoming onboardings or renewals.

### Files to Create

#### 1. [NEW] `components/admin/crm/upcoming-customers.tsx`
- Query customers where `start_date >= today`
- Sort by closest date first
- Show: Company Name, Start Date, Product, Status
- Calendar view or list view

### Files to Modify

#### 1. [MODIFY] `app/(admin)/customers/page.tsx`
- Add sub-nav tab: "Upcoming"
- Render `<UpcomingCustomers />` when selected

---

# Implementation Order (Recommended)

## Phase 1: Foundation
1. Create `lib/data/team.ts` with data fetching functions
2. Create Team API routes (`app/api/team/...`)
3. Create Team page and components
4. Add Team to sidebar

## Phase 2: Quick Actions
5. Create `ReminderDialog` component
6. Update `QuickActionButton` with reminder option

## Phase 3: Customers UX Overhaul
7. Fix sub-navigation to conditionally render views
8. Separate add-new from list/review
9. Add `CustomersOverviewStats`
10. Add filter bar improvements
11. Create `ChecklistPopup`
12. Create `FulfillmentTasks`
13. Create `UpcomingCustomers`

---

# UI/UX Design Guidelines (CRITICAL)

All new components MUST follow these design rules. This is a professional CRM app with dark mode aesthetics.

---

## Design System Overview

| Aspect | Value |
|--------|-------|
| **Style** | Glassmorphism + Dark Mode |
| **Primary Colors** | Orange/Pink gradient (`from-orange-400 to-pink-400`) |
| **Background** | Radial gradient: `hsl(30 20% 8%) → hsl(264 20% 2%)` |
| **Cards** | `glass-panel` class with `bg-white/5`, `backdrop-blur` |
| **Text** | White primary, `text-muted-foreground` for secondary |
| **Borders** | `border-border/50` or `border-border/60` |
| **Border Radius** | `rounded-2xl` for cards, `rounded-xl` for inner elements |
| **Shadows** | `shadow-glow` for accent elements |

---

## Icon Rules (CRITICAL)

| Rule | Do | Don't |
|------|----|----- |
| **No emoji icons** | Use SVG icons from Lucide (`lucide-react`) | Use emojis like 🎨 🚀 ⚙️ as UI icons |
| **Consistent sizing** | Use `h-4 w-4` for menu items, `h-6 w-6` for buttons | Mix different icon sizes |
| **Import correctly** | `import { Bell, Users2 } from "lucide-react"` | Use incorrect or made-up icon names |

**Available icons in codebase**: `ClipboardCheck`, `LayoutGrid`, `Megaphone`, `Settings`, `Users`, `DollarSign`, `Plus`, `UserPlus`, `FolderPlus`, `ListTodo`, `Loader2`, `Search`

---

## Interaction & Cursor (CRITICAL)

| Rule | Do | Don't |
|------|----|----- |
| **Cursor pointer** | Add `cursor-pointer` to all clickable cards/buttons | Leave default cursor on interactive elements |
| **Hover feedback** | Use `hover:bg-white/10` or color transitions | No indication element is interactive |
| **Smooth transitions** | Use `transition-colors duration-200` | Instant state changes or >500ms |
| **Loading states** | Disable buttons during async, show `<Loader2 className="animate-spin" />` | Allow double-clicks or no feedback |

---

## Component Patterns (Follow Existing Codebase)

### Cards
```tsx
<Card className="p-5">
  <div className="label-mono text-xs text-muted-foreground">Label</div>
  <div className="mt-3 text-2xl font-semibold">Value</div>
  <div className="mt-1 text-xs text-accent">Subtitle</div>
</Card>
```

### Glass Panels
```tsx
<div className="glass-panel rounded-2xl p-4">
  {/* content */}
</div>
```

### Stat Items
```tsx
<div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
  <div>
    <div className="text-sm font-medium">Title</div>
    <div className="text-xs text-muted-foreground">Subtitle</div>
  </div>
  <Badge variant="warning">Alert</Badge>
</div>
```

### Buttons
```tsx
// Primary action
<Button size="lg" className="h-12 w-12 rounded-full shadow-glow">
  <Plus className="h-6 w-6" />
</Button>

// Secondary
<Button variant="outline">Action</Button>

// Link button
<Button asChild variant="ghost" size="sm">
  <Link href="/path">Label</Link>
</Button>
```

### Forms
```tsx
<Input
  placeholder="Placeholder text"
  className="bg-black/20 border-border/50"
/>

<Select>
  <SelectTrigger className="bg-black/20 border-border/50">
    <SelectValue placeholder="Choose..." />
  </SelectTrigger>
  <SelectContent className="glass-panel">
    <SelectItem value="option">Option</SelectItem>
  </SelectContent>
</Select>
```

### Dialogs/Popovers
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent className="glass-panel">
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* content */}
  </DialogContent>
</Dialog>
```

---

## Accessibility (CRITICAL)

| Rule | Implementation |
|------|----------------|
| **Color contrast** | Minimum 4.5:1 ratio — use `text-white` or `text-muted-foreground` |
| **Focus states** | All interactive elements must have visible focus rings |
| **Keyboard nav** | Tab order matches visual order |
| **Form labels** | Use `<Label htmlFor="id">` with matching input `id` |
| **ARIA labels** | Add `aria-label` for icon-only buttons |

---

## Layout Rules

| Rule | Do | Don't |
|------|----|----- |
| **Max width** | Use `max-w-7xl` consistently | Mix different container widths |
| **Spacing** | Use `space-y-10` between sections, `gap-6` for grids | Inconsistent spacing |
| **Responsive** | Use `grid-cols-1 md:grid-cols-2 xl:grid-cols-4` | Fixed columns that break on mobile |
| **Z-index** | Define z-index scale (10, 20, 30, 50) | Random z-index values |

---

## Typography

| Element | Classes |
|---------|---------|
| Page headers | `headline-serif text-lg` |
| Section labels | `label-mono text-xs text-muted-foreground` |
| Card titles | `text-2xl font-semibold` |
| Body text | `text-sm font-medium` |
| Muted text | `text-xs text-muted-foreground` |
| Accent text | `text-xs text-accent` |

---

## Badge Variants

```tsx
<Badge variant="default">Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Danger</Badge>
```

---

## Pre-Delivery Checklist

Before delivering any component, verify:

### Visual Quality
- [ ] No emojis used as icons (use Lucide SVG instead)
- [ ] All icons from Lucide icon set
- [ ] Hover states don't cause layout shift
- [ ] Glass panels use correct opacity (`bg-white/5` for dark mode)

### Interaction
- [ ] All clickable elements have `cursor-pointer`
- [ ] Hover states provide visual feedback
- [ ] Transitions are smooth (150-300ms)
- [ ] Loading states show spinner

### Accessibility
- [ ] All form inputs have labels
- [ ] Focus states visible for keyboard navigation
- [ ] Color is not the only indicator

### Layout
- [ ] Responsive at 375px, 768px, 1024px, 1440px
- [ ] No horizontal scroll on mobile
- [ ] Consistent spacing with existing pages

---

# Verification Checklist

- [ ] Team section accessible from sidebar
- [ ] Team member profiles display correctly
- [ ] Can add/edit team members
- [ ] "Set Reminder" appears in + menu
- [ ] Reminder sets `reminder_date` and updates `action_status`
- [ ] Customers sub-nav properly isolates views
- [ ] Overview stats display at top of Customers page
- [ ] Checklist ⓘ popup works
- [ ] Filters work (industry, type, product)
- [ ] Tasks view shows action_status-based tasks
- [ ] Upcoming view shows future start_date customers
- [ ] `npm run build` passes with no errors
