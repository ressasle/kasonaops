# Phase 2: Comprehensive Building Plan

> Based on Video Transcript Analysis & User Testing Feedback
> **Date**: 2026-02-05
> **Style**: Kasona cosmic dark premium (glass panels, orange/cyan glows)

---

## Overview

**Goal**: Address all UI/UX issues, fix data synchronization, and implement missing functionality based on hands-on testing session.

**Priority Order**:
1. 🔴 **Critical** - Blocking user workflow
2. 🟠 **High** - Major functionality gaps
3. 🟡 **Medium** - UX improvements
4. 🟢 **Low** - Nice-to-have enhancements

---

## Section 1: Global Navigation & UI Layout

### 1.1 Main Navigation (Sidebar)
**Status**: ✅ Keep as-is
**Priority**: 🟢 Low

> [!NOTE]
> Current sidebar navigation is confirmed working. No changes needed.

---

### 1.2 Search Bar
**Priority**: 🟠 High  
**File**: `app/(admin)/layout.tsx`

#### Requirements
- Position: Top of page (above sub-navigation)
- Functionality: Global search across all entities (customers, assets, tasks)

#### Implementation

```tsx
// Add to layout.tsx header section
<div className="flex items-center gap-4 mb-4">
  <div className="relative flex-1 max-w-md">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input 
      placeholder="Search customers, assets, tasks..." 
      className="pl-10 bg-black/20 border-border/50"
    />
  </div>
</div>
```

---

### 1.3 "Big +" Quick Action Button
**Priority**: 🟠 High  
**File**: `components/admin/quick-action-button.tsx` (NEW)

#### Requirements
| Action | Behavior |
|--------|----------|
| New Task | Opens task creation modal |
| New Lead | Redirects to "Create Customer Basic Info" |
| New Onboarding | Opens portfolio assets with Customer ID pre-filled |

#### Implementation

```tsx
// components/admin/quick-action-button.tsx
import { Plus, UserPlus, FolderPlus, ListTodo } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function QuickActionButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="lg" className="h-12 w-12 rounded-full shadow-glow">
          <Plus className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-panel">
        <DropdownMenuItem onClick={() => openTaskModal()}>
          <ListTodo className="h-4 w-4 mr-2" />
          New Task
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/customers/new')}>
          <UserPlus className="h-4 w-4 mr-2" />
          New Lead
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openOnboarding()}>
          <FolderPlus className="h-4 w-4 mr-2" />
          New Onboarding
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

### 1.4 Sub-Navigation Bar
**Priority**: 🟡 Medium  
**Location**: Each section page (Sales, Operations, etc.)

#### Requirements
- Position: Below search bar
- Purpose: Section-specific navigation (tabs/filters)

#### Files to Modify
- `app/(admin)/sales/layout.tsx`
- `app/(admin)/operations/layout.tsx`
- `app/(admin)/customers/layout.tsx`

#### Pattern

```tsx
// Section sub-navigation pattern
<div className="flex items-center gap-2 border-b border-border/50 pb-4 mb-6">
  <Button variant={tab === 'overview' ? 'default' : 'ghost'} size="sm">
    Overview
  </Button>
  <Button variant={tab === 'kanban' ? 'default' : 'ghost'} size="sm">
    Kanban
  </Button>
  <Button variant={tab === 'list' ? 'default' : 'ghost'} size="sm">
    List View
  </Button>
</div>
```

---

## Section 2: Dashboard / Overview

**File**: `app/(admin)/dashboard/page.tsx`
**Priority**: 🟡 Medium

### Current Status
- ✅ 5 active portfolios confirmed
- ❌ MRR not displayed
- ❌ Pipeline Value not displayed

### Required Changes

#### 2.1 Add MRR Stats Card
```tsx
<StatsCard
  label="Monthly Recurring Revenue"
  value={formatCurrency(mrr)}
  trend="+12.5%"
  icon={<DollarSign className="h-4 w-4" />}
/>
```

#### 2.2 Add Pipeline Value Card
```tsx
<StatsCard
  label="Pipeline Value"
  value={formatCurrency(pipelineValue)}
  trend="+8.3%"
  icon={<TrendingUp className="h-4 w-4" />}
/>
```

#### 2.3 Data Sources
| Metric | Source Table | Calculation |
|--------|--------------|-------------|
| MRR | `kasona_customer_basic_info` | SUM of active subscriptions |
| Pipeline Value | `kasona_crm_pipeline` | SUM where status != 'closed' |

---

## Section 3: Sales Page

**Files**: 
- `app/(admin)/sales/page.tsx`
- `components/admin/sales/kanban-board.tsx` (NEW)

**Priority**: 🔴 Critical

### 3.1 Remove Mock Data
Replace current static mock data with real Supabase queries.

### 3.2 Kanban Board View (NEW)
**Priority**: 🔴 Critical

```tsx
// components/admin/sales/kanban-board.tsx
const PIPELINE_STAGES = [
  { id: 'lead', label: 'New Lead', color: 'bg-cyan-500/20' },
  { id: 'qualified', label: 'Qualified', color: 'bg-yellow-500/20' },
  { id: 'meeting', label: 'Meeting Booked', color: 'bg-orange-500/20' },
  { id: 'proposal', label: 'Proposal Sent', color: 'bg-primary/20' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-pink-500/20' },
  { id: 'won', label: 'Won', color: 'bg-green-500/20' },
];

export function KanbanBoard({ leads }: { leads: Lead[] }) {
  return (
    <div className="grid grid-cols-6 gap-4">
      {PIPELINE_STAGES.map(stage => (
        <div key={stage.id} className={`glass-panel p-4 ${stage.color}`}>
          <h3 className="font-semibold mb-4">{stage.label}</h3>
          <div className="space-y-3">
            {leads
              .filter(lead => lead.stage === stage.id)
              .map(lead => (
                <KanbanCard key={lead.id} lead={lead} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 3.3 Data Connections

| Element | Source |
|---------|--------|
| New Leads | `kasona_customer_basic_info` (Supply Base) |
| Meetings | `kasona_crm_pipeline.stage = 'meeting'` |
| Offers | `kasona_crm_pipeline.stage = 'proposal'` |
| Win Rate | Calculated from closed deals |

---

## Section 4: Operations Page

**Files**:
- `app/(admin)/operations/page.tsx`
- `components/admin/operations/fulfillment-queue.tsx`
- `components/admin/operations/podcast-controls.tsx` (NEW)

**Priority**: 🔴 Critical

### 4.1 Fulfillment Queue
**Status**: Layout confirmed "quite okay"

### 4.2 Podcast Logic
**Priority**: 🔴 Critical

#### Requirements
1. Publishing rhythm → linked to Investor Profile
2. View permissions → filtered by owner
3. Admin override → see all owners

#### Implementation

```tsx
// Podcast rhythm from investor profile
const getPodcastSchedule = (investorProfile: InvestorProfile) => {
  const { output_frequency } = investorProfile;
  return {
    daily: 'Every weekday at 7:00 AM',
    weekly: 'Every Monday at 9:00 AM',
    monthly: 'First Monday of month at 9:00 AM',
  }[output_frequency];
};

// Owner filter with admin override
const FulfillmentQueue = ({ isAdmin, currentUserId }) => {
  const [viewAllOwners, setViewAllOwners] = useState(false);
  
  const { data: queue } = useQuery({
    queryKey: ['fulfillment-queue', viewAllOwners],
    queryFn: () => fetchQueue(isAdmin && viewAllOwners ? null : currentUserId),
  });
  
  return (
    <>
      {isAdmin && (
        <div className="flex items-center gap-2 mb-4">
          <Switch checked={viewAllOwners} onCheckedChange={setViewAllOwners} />
          <Label>Show all owners</Label>
        </div>
      )}
      {/* Queue items */}
    </>
  );
};
```

### 4.3 Podcast Controls
**Priority**: 🟠 High

```tsx
// components/admin/operations/podcast-controls.tsx
export function PodcastControls({ customerId }: { customerId: string }) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  return (
    <div className="flex gap-2">
      <Button 
        onClick={handleGenerate} 
        disabled={isGenerating}
        className="gap-2"
      >
        {isGenerating ? <Loader2 className="animate-spin" /> : <Podcast />}
        Generate Podcast
      </Button>
      <Button variant="outline" onClick={() => openReviewModal()}>
        <Eye className="h-4 w-4 mr-2" />
        Review
      </Button>
    </div>
  );
}
```

### 4.4 Q&A Check Buttons
**Priority**: 🟠 High  
**Issue**: Buttons currently non-functional

> [!WARNING]
> Q&A check logic needs to be defined and documented before implementation.

---

## Section 5: Tracking Page (REMOVE)

**Priority**: 🔴 Critical  
**Action**: DELETE entire section

### Files to Remove
- `app/(admin)/tracking/page.tsx`
- `app/(admin)/tracking/layout.tsx` (if exists)

### Migration Steps
1. Identify valuable tracking elements
2. Move to Sales page
3. Update navigation to remove Tracking
4. Remove route files

---

## Section 6: Customer / Company Profile Page

**Files**:
- `app/(admin)/customers/[id]/page.tsx`
- `components/admin/crm/company-profile.tsx`

**Priority**: 🔴 Critical

### 6.1 Supabase Sync Fix
**Issue**: Data not syncing correctly
**Priority**: 🔴 Critical

> [!CAUTION]
> Error: "Could not find the contact_person_position column of kasona_customer_basic_info in schema cage."
> 
> This indicates a schema mismatch. Verify column exists in Supabase.

#### Action Items
1. Check Supabase schema for `contact_person_position`
2. Add migration if missing
3. Update TypeScript types

### 6.2 Relaxed Profile Creation
**Priority**: 🔴 Critical

#### Mandatory Fields Only
| Field | Required |
|-------|----------|
| `company_name` | ✅ YES |
| `contact_person` | ✅ YES |
| All others | ❌ NO |

#### Implementation

```tsx
// Validation schema update
const createProfileSchema = z.object({
  company_name: z.string().min(1, "Company name required"),
  contact_person: z.string().min(1, "Contact person required"),
  // All other fields optional
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  // ... rest optional
});
```

### 6.3 Incomplete Profile Flag
**Priority**: 🟡 Medium

```tsx
// Add visual indicator for incomplete profiles
const ProfileCompleteness = ({ profile }) => {
  const requiredFields = ['company_name', 'contact_person', 'email', 'phone'];
  const filledFields = requiredFields.filter(f => profile[f]);
  const percentage = (filledFields.length / requiredFields.length) * 100;
  
  if (percentage < 100) {
    return (
      <Badge variant="warning" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        Profile Incomplete ({percentage.toFixed(0)}%)
      </Badge>
    );
  }
  return <Badge variant="success">Complete</Badge>;
};
```

### 6.4 Toggle Sections
**Priority**: 🟡 Medium

| Toggle | Status |
|--------|--------|
| Show Documentation Info | ✅ Keep |
| Show Finance Info | ➕ Add |

```tsx
<div className="flex gap-4">
  <div className="flex items-center gap-2">
    <Switch checked={showDocs} onCheckedChange={setShowDocs} />
    <Label>Show Documentation</Label>
  </div>
  <div className="flex items-center gap-2">
    <Switch checked={showFinance} onCheckedChange={setShowFinance} />
    <Label>Show Finance Info</Label>
  </div>
</div>
```

---

## Section 7: Portfolio Assets & Enrichment

**Files**:
- `components/admin/crm/portfolio-assets.tsx`
- `app/(admin)/customers/[id]/assets/page.tsx` (NEW)

**Priority**: 🟠 High

### 7.1 ID Cleanup
**Issue**: "Company ID" and "Customer ID" are identical

#### Action
Remove `company_id` display, keep only Customer ID as the singular identifier.

### 7.2 Simplify Enrichment
**Priority**: 🟠 High

| Before | After |
|--------|-------|
| Multiple confusing buttons | Single "Enrich" button |
| Scattered placement | Prominent top location |

```tsx
<div className="flex items-center justify-between mb-6">
  <h2 className="text-xl font-semibold">Portfolio Assets</h2>
  <Button onClick={handleEnrich} className="gap-2 shadow-glow">
    <Sparkles className="h-4 w-4" />
    Enrich All Assets
  </Button>
</div>
```

### 7.3 Dedicated Portfolio Assets Page
**Priority**: 🟡 Medium

Create new route: `/customers/[id]/assets`

---

## Section 8: Investor Profile (New Concept)

**Files**:
- `app/(admin)/customers/[id]/investor-profile/page.tsx` (NEW)
- `components/admin/crm/investor-profile-overview.tsx` (NEW)

**Priority**: 🟡 Medium

### 8.1 Overview Page Requirements

```tsx
// Customer selector + profile view
<Card className="glass-panel">
  <CardHeader>
    <CardTitle>Investor Profile</CardTitle>
    <CustomerSelector onSelect={setSelectedCustomer} />
  </CardHeader>
  <CardContent>
    <Tabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="content">Created Content</TabsTrigger>
        <TabsTrigger value="tokens">Token Usage</TabsTrigger>
        <TabsTrigger value="files">Accessible Files</TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile">
        <InvestorDNADisplay profile={selectedProfile} />
      </TabsContent>
      
      <TabsContent value="content">
        <ContentTracker customerId={selectedCustomer} />
      </TabsContent>
      
      <TabsContent value="tokens">
        <TokenUsage customerId={selectedCustomer} />
      </TabsContent>
      
      <TabsContent value="files">
        <FileAccessLog customerId={selectedCustomer} />
      </TabsContent>
    </Tabs>
  </CardContent>
</Card>
```

---

## Section 9: New Customer Flow (Wizard)

**File**: `app/(admin)/onboarding/page.tsx`
**Priority**: 🔴 Critical

### 9.1 UI Width Fix
**Issue**: Form too slim, should cover full page

```tsx
// Change from
<div className="max-w-md mx-auto">

// To
<div className="max-w-4xl mx-auto">
```

### 9.2 InvestorDNA Testing
**Status**: Needs testing after Company Profile blocker is fixed

### 9.3 Company Profile Blocker
**Priority**: 🔴 Critical

> [!CAUTION]
> Currently stuck at Company Profile step. Cannot proceed to test subsequent steps.
> 
> Investigate form validation and submission flow.

---

## Section 10: Tech & Infrastructure

**Priority**: 🟠 High

### 10.1 Auto-Sync Implementation

#### Goal
Remove need for manual "Sync to Supabase" button clicks.

#### Implementation Strategy

```tsx
// Real-time sync with Supabase
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Subscribe to changes
useEffect(() => {
  const subscription = supabase
    .channel('db-changes')
    .on('postgres_changes', { event: '*', schema: 'public' }, handleSync)
    .subscribe();
    
  return () => subscription.unsubscribe();
}, []);
```

---

## Section 11: Finance & Settings

**Status**: 🟢 Deferred to later phase

> [!NOTE]
> No changes required in Phase 2. Will be addressed in Phase 3.

---

## Verification Plan

### Automated Tests
Currently no automated tests discovered. Recommend adding:
1. Unit tests for form validation
2. Integration tests for Supabase sync
3. E2E tests for customer creation flow

### Manual Verification

| Feature | Test Steps |
|---------|------------|
| Quick Action Button | 1. Click + button 2. Verify dropdown appears 3. Click each option |
| Kanban Board | 1. Navigate to Sales 2. Switch to Kanban view 3. Drag card between stages |
| Customer Creation | 1. Click New Lead 2. Fill only Company Name + Contact 3. Submit 4. Verify incomplete badge |
| Enrichment | 1. Open customer 2. Click Enrich 3. Verify loading state 4. Check data updates |
| Podcast Controls | 1. Open Operations 2. Click Generate 3. Click Review 4. Verify modals |

### Browser Testing
```bash
cd "the list tool"
npm run dev
# Open http://localhost:3000
```

---

## Checklist

### Section 1: Navigation
- [ ] Add search bar to top
- [ ] Create quick action button component
- [ ] Add sub-navigation to all sections

### Section 3: Sales
- [ ] Replace mock data with real queries
- [ ] Implement Kanban board view
- [ ] Add drag-and-drop functionality

### Section 4: Operations
- [ ] Link podcast to investor profile
- [ ] Add owner filter with admin override
- [ ] Add Generate Podcast button
- [ ] Add Review button
- [ ] Fix Q&A buttons

### Section 6: Customer Profile
- [ ] Fix Supabase sync
- [ ] Fix column error
- [ ] Relax validation (only 2 required fields)
- [ ] Add incomplete profile badge
- [ ] Add Finance Info toggle

### Section 7: Portfolio Assets
- [ ] Remove duplicate ID display
- [ ] Simplify to single Enrich button
- [ ] Create dedicated assets page

### Section 8: Investor Profile
- [ ] Create overview page
- [ ] Add content tracking
- [ ] Add token tracking
- [ ] Add file access view

### Section 9: Customer Wizard
- [ ] Fix UI width
- [ ] Debug Company Profile blocker
- [ ] Test InvestorDNA

### Section 10: Infrastructure
- [ ] Implement auto-sync
- [ ] Remove manual sync button reliance
