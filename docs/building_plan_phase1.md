@# Phase 1: UI Enhancement Building Plan

> Detailed specifications for Opencode handoff

---

## Overview

**Goal**: Make customer/portfolio setup seamless and beautiful
**Style**: Kasona cosmic dark premium (glass panels, orange/cyan glows)
**Timeline**: Week 1-2

---

## Task 1: Investor Profile Slider Enhancement

**File**: `components/admin/crm/investor-profile-form.tsx`

### Current State
- Only `risk_appetite` slider (0-100 scale)
- Missing: `data_granularity`, `action_frequency`, `decision_logic`

### Required Changes

1. **Add 4 DNA Sliders** (1-5 scale each):

```tsx
// State additions
const [formData, setFormData] = useState({
  // existing fields...
  data_granularity: 3,    // NEW
  action_frequency: 3,    // NEW  
  decision_logic: 3,      // NEW
  risk_appetite: 3,       // CHANGE to 1-5 scale
});
```

2. **Slider Component Styling** (per style_guide.md):

```tsx
<div className="space-y-4 rounded-xl border border-border/50 bg-black/20 p-4">
  <div className="flex items-center justify-between">
    <Label className="text-base">Data Granularity</Label>
    <div className="font-mono text-xl font-bold text-primary">
      {formData.data_granularity}
      <span className="text-sm font-normal text-muted-foreground ml-2">
        {formData.data_granularity <= 2 ? "(Big Picture)" : formData.data_granularity >= 4 ? "(Analyst Mode)" : "(Balanced)"}
      </span>
    </div>
  </div>
  <Slider
    value={formData.data_granularity}
    onChange={(val) => handleChange("data_granularity", val)}
    min={1}
    max={5}
    step={1}
    className="py-2"
  />
  <div className="flex justify-between text-xs text-muted-foreground uppercase font-semibold">
    <span>Trend Only</span>
    <span>Balanced</span>
    <span>Exact Numbers</span>
  </div>
</div>
```

3. **Visual Glow on Active Slider**:
```css
.slider-thumb:active {
  box-shadow: 0 0 20px hsl(33 100% 58% / 0.4);
}
```

4. **Labels for Each**:

| Slider | Low Label | Mid | High Label |
|--------|-----------|-----|------------|
| `data_granularity` | "Trend Only" | "Balanced" | "Exact Numbers" |
| `action_frequency` | "Long-term" | "Weekly" | "Immediate" |
| `decision_logic` | "Story/Emotion" | "Mixed" | "Logic Only" |
| `risk_appetite` | "Defensive" | "Balanced" | "Aggressive" |

### API Update
**File**: `app/api/investor-profiles/route.ts`

Add new fields to payload:
```ts
const payload = {
  // existing...
  data_granularity: formData.data_granularity,
  action_frequency: formData.action_frequency,
  decision_logic: formData.decision_logic,
};
```

---

## Task 2: CSV Import UI

**Location**: New component + integration in CompanyProfile

### Files to Create/Modify

1. **NEW**: `components/admin/crm/csv-import-dialog.tsx`
2. **MODIFY**: `components/admin/crm/company-profile.tsx`

### CSV Import Dialog Spec

```tsx
// Props
type CSVImportDialogProps = {
  portfolioId: string;
  companyId: number;
  onSuccess: () => void;
};

// UI Structure
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline" className="gap-2">
      <Upload className="h-4 w-4" />
      Import CSV
    </Button>
  </DialogTrigger>
  <DialogContent className="glass-panel sm:max-w-lg">
    <DialogHeader>
      <DialogTitle>Import Portfolio Assets</DialogTitle>
      <DialogDescription>
        Upload a CSV with columns: stock_name, ticker, isin, currency, asset_class
      </DialogDescription>
    </DialogHeader>
    
    {/* File drop zone */}
    <div className="border-2 border-dashed border-border/60 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
      <p>Drop CSV here or click to browse</p>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
    </div>
    
    {/* Preview table */}
    {parsedRows.length > 0 && (
      <Table>
        <TableHeader>...</TableHeader>
        <TableBody>
          {parsedRows.slice(0, 5).map(row => ...)}
        </TableBody>
      </Table>
    )}
    
    {/* Auto-enrich checkbox */}
    <div className="flex items-center gap-2">
      <Checkbox id="auto-enrich" checked={autoEnrich} onCheckedChange={setAutoEnrich} />
      <Label htmlFor="auto-enrich">Run enrichment after import</Label>
    </div>
    
    <DialogFooter>
      <Button onClick={handleImport} disabled={!parsedRows.length}>
        Import {parsedRows.length} assets
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### CSV Parsing Logic
```ts
const parseCSV = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target?.result as string;
    const rows = text.split('\n').map(row => row.split(','));
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      return headers.reduce((acc, h, i) => ({ ...acc, [h.trim()]: row[i]?.trim() }), {});
    });
    setParsedRows(data);
  };
  reader.readAsText(file);
};
```

### API Call
```ts
const response = await fetch('/api/portfolio-assets/bulk', {
  method: 'POST',
  body: JSON.stringify({
    portfolio_id: portfolioId,
    company_id: companyId,
    assets: parsedRows,
    auto_enrich: autoEnrich,
  }),
});
```

---

## Task 3: Bulk Enrichment Button

**File**: `components/admin/crm/company-profile.tsx`

### Add to Portfolio Assets Card Header

```tsx
<CardHeader>
  <CardTitle>Portfolio Assets</CardTitle>
  <div className="flex items-center gap-2">
    <Badge variant="default">{visibleAssets.length} assets</Badge>
    
    {/* NEW: Enrichment Button */}
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleEnrichAll}
      disabled={isEnriching}
      className="gap-2"
    >
      {isEnriching ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      Enrich All
    </Button>
    
    {/* NEW: CSV Import */}
    <CSVImportDialog 
      portfolioId={activePortfolio ?? profiles[0]?.portfolio_id} 
      companyId={customer.company_id}
      onSuccess={refreshAssets}
    />
  </div>
</CardHeader>
```

### Enrichment Handler
```ts
const [isEnriching, setIsEnriching] = useState(false);

const handleEnrichAll = async () => {
  setIsEnriching(true);
  try {
    const response = await fetch('/api/portfolio-assets/enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'portfolio',
        portfolio_id: activePortfolio ?? profiles[0]?.portfolio_id,
        skipEnriched: false,
      }),
    });
    const result = await response.json();
    toast.success(`Enriched ${result.enriched} of ${result.total} assets`);
    refreshAssets();
  } catch (error) {
    toast.error('Enrichment failed');
  } finally {
    setIsEnriching(false);
  }
};
```

---

## Task 4: Enrichment Status Indicators

**File**: `components/admin/crm/company-profile.tsx`

### Add Status Column to Assets Table

```tsx
<TableHead>Status</TableHead>

// In row:
<TableCell>
  {asset.ticker_eod && asset.description ? (
    <Badge variant="success" className="gap-1">
      <CheckCircle className="h-3 w-3" /> Complete
    </Badge>
  ) : asset.ticker_eod ? (
    <Badge variant="warning" className="gap-1">
      <AlertCircle className="h-3 w-3" /> Partial
    </Badge>
  ) : (
    <Badge variant="destructive" className="gap-1">
      <XCircle className="h-3 w-3" /> Not Enriched
    </Badge>
  )}
</TableCell>
```

---

## Task 5: Persona Templates Dropdown

**File**: `components/admin/crm/investor-profile-form.tsx`

### Add Template Selector

```tsx
const PERSONA_TEMPLATES = [
  {
    name: "Professional Investor (Daily)",
    data_granularity: 5,
    action_frequency: 5,
    decision_logic: 5,
    risk_appetite: 4,
    output_format: "Newsletter",
    output_frequency: "daily",
  },
  {
    name: "Wealthy Part-Time (Weekly)",
    data_granularity: 3,
    action_frequency: 3,
    decision_logic: 3,
    risk_appetite: 3,
    output_format: "Podcast",
    output_frequency: "weekly",
  },
  {
    name: "Passive Investor (Monthly)",
    data_granularity: 1,
    action_frequency: 1,
    decision_logic: 2,
    risk_appetite: 2,
    output_format: "Newsletter",
    output_frequency: "monthly",
  },
];

// UI Component
<div className="space-y-2">
  <Label>Quick Start: Choose Persona</Label>
  <select
    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
    onChange={(e) => {
      const template = PERSONA_TEMPLATES.find(t => t.name === e.target.value);
      if (template) {
        setFormData(prev => ({ ...prev, ...template }));
      }
    }}
  >
    <option value="">Custom Settings</option>
    {PERSONA_TEMPLATES.map(t => (
      <option key={t.name} value={t.name}>{t.name}</option>
    ))}
  </select>
</div>
```

---

## Task 6: Failed Match Review Table

**Location**: New tab or section in CompanyProfile

### Add Tab for Review Queue

```tsx
// Tab structure
<Tabs defaultValue="assets">
  <TabsList>
    <TabsTrigger value="assets">All Assets</TabsTrigger>
    <TabsTrigger value="review">
      Needs Review 
      <Badge variant="destructive" className="ml-2">{needsReviewCount}</Badge>
    </TabsTrigger>
  </TabsList>
  
  <TabsContent value="review">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asset</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {failedAssets.map(asset => (
          <TableRow key={asset.id}>
            <TableCell>{asset.stock_name}</TableCell>
            <TableCell>
              <Badge variant="warning">No match found</Badge>
            </TableCell>
            <TableCell>
              <Button size="sm" onClick={() => openTickerOverride(asset)}>
                Set Ticker
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TabsContent>
</Tabs>
```

---

## Checklist

- [ ] Task 1: Add 4 DNA sliders with glow styling
- [ ] Task 2: CSV import dialog with preview
- [ ] Task 3: Bulk enrichment button
- [ ] Task 4: Enrichment status indicators
- [ ] Task 5: Persona templates dropdown
- [ ] Task 6: Failed match review table
