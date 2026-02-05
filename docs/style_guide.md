
# Style Guide: Kasona Operations & Wealth App

## Ziel
Erstelle eine komplette Style-Dokumentation im Markdown-Format, die alle Design-Tokens, Komponenten-Patterns und Best Practices für die neue Admin-App enthält - basierend auf dem bestehenden Kasona Design System.

---

## Dokument-Struktur

### 1. Brand Foundation
- Mission & Designphilosophie
- Cosmic Dark Premium Aesthetic
- Logo-Nutzung (Theme-abhängig)

### 2. Farbsystem
```text
LIGHT MODE                          DARK MODE (Standard)
+---------------------------+       +---------------------------+
| Background: #fafafa       |       | Background: #050507       |
| Foreground: #0d0a10       |       | Foreground: #ffffff       |
| Card: #ffffff (solid)     |       | Card: white/3% (glass)    |
+---------------------------+       +---------------------------+

BRAND COLORS (beide Modi)
+-------------------+-------------------+-------------------+-------------------+
| Primary Orange    | Cyan Blue         | Yellow            | Pink              |
| #ff9627           | #95ddfa           | #ffcc54           | #f66096           |
| HSL: 33 100% 58%  | HSL: 195 91% 78%  | HSL: 48 100% 67%  | HSL: 342 90% 67%  |
+-------------------+-------------------+-------------------+-------------------+
```

### 3. Typografie
- **Playfair Display (Italic)**: Headlines, Seitentitel
- **Montserrat**: Body Text, Navigation, Buttons
- **Space Mono**: Datenwerte, Labels, technische Infos

### 4. Komponenten-Patterns

**Glass Panels**
```css
.glass-panel {
  background: hsl(0 0% 100% / 3%);
  backdrop-filter: blur(20px);
  border: 1px solid hsl(0 0% 100% / 5%);
  border-radius: 0.75rem;
}
```

**Glow Effects**
- Primary Glow: `box-shadow: 0 0 40px hsl(33 100% 58% / 0.3)`
- Cyan Glow: `box-shadow: 0 0 40px hsl(195 91% 78% / 0.2)`

**Button Variants**
- Default: Primary orange mit Glow
- Ghost: Transparent mit Hover-Accent
- Outline: Border mit Glass-Effekt

### 5. Layout-Patterns

**Admin Navigation (Sidebar)**
```text
+--------+------------------------------------------+
|        |  Header (Logo + User)                   |
| S      +------------------------------------------+
| I      |                                          |
| D      |  Main Content Area                       |
| E      |  - Cards mit Glassmorphism               |
| B      |  - Tabellen mit Zebra-Stripes            |
| A      |  - Charts mit Orange-Cyan Gradient       |
| R      |                                          |
+--------+------------------------------------------+
```

**Page Structure**
- Container: `max-w-6xl mx-auto px-4 py-8`
- Grid: `grid gap-6` mit responsive Breakpoints
- Cards: `glass-panel` Klasse

### 6. Admin-spezifische Komponenten

**Data Tables**
- Header: `text-muted-foreground font-medium`
- Rows: `border-b border-border/50`
- Modified State: `bg-primary/5`

**Stats Cards**
```text
+---------------------------+
| LABEL (mono, uppercase)   |
| 12.345                    |
| +5.2% vs. Vorquartal      |
+---------------------------+
```

**Form Inputs**
- Background: `hsl(var(--input))`
- Border: `border-input`
- Focus: `ring-2 ring-ring ring-offset-2`

**Visual Sliders (Investment DNA)**
- Track: `h-2 bg-secondary/20 rounded-full`
- Thumb: `h-6 w-6 bg-primary border-2 border-background shadow-glow cursor-pointer transition-transform hover:scale-110`
- Labels: `text-xs font-mono text-muted-foreground mt-2 flex justify-between`

### 7. Icons
- **Lucide React** als Icon-Library
- Größen: `h-4 w-4` (small), `h-5 w-5` (default), `h-8 w-8` (large)
- Farben: `text-primary`, `text-muted-foreground`, `text-secondary`

### 8. Animationen
- **fade-in**: Seitenübergänge
- **glow-pulse**: Wichtige CTAs
- **spin-slow**: Loading states

### 9. Responsive Breakpoints
- Mobile: `< 640px`
- Tablet: `640px - 1024px`
- Desktop: `> 1024px`

### 10. Dark/Light Mode
- Automatische Anpassung via CSS Custom Properties
- Logo-Wechsel: `kasona-logo-dark.png` / `kasona-logo-light.png`
- Theme Storage: `localStorage.getItem('kasona-theme')`

---

## Dateien die erstellt werden

| Datei | Beschreibung |
|-------|--------------|
| `docs/KASONA_ADMIN_STYLE.md` | Vollständige Style-Dokumentation |

---

## Technische Details

### CSS Custom Properties
Alle Farben werden über HSL-basierte CSS-Variablen gesteuert:
```css
--primary: 33 100% 58%;      /* Orange */
--secondary: 195 91% 78%;    /* Cyan */
--destructive: 342 90% 67%;  /* Pink */
--kasona-yellow: 48 100% 67%;
```

### Tailwind Config Extension
```typescript
fontFamily: {
  sans: ['Montserrat', 'system-ui', 'sans-serif'],
  serif: ['Playfair Display', 'Georgia', 'serif'],
  mono: ['Space Mono', 'monospace'],
}
```

### Utility Classes (Custom)
| Klasse | Verwendung |
|--------|------------|
| `glass-panel` | Standard Container |
| `glass-panel-hover` | Interaktive Cards |
| `gradient-text-hero` | Hero Headlines |
| `headline-serif` | Seitentitel |
| `label-mono` | Daten-Labels |
| `data-value` | Kennzahlen |
| `glow-orange` | Akzent-Effekt |
| `shadow-glow` | Button Highlights |

---

## Implementierungshinweise für die Admin App

### Empfohlene Struktur
```text
src/
├── components/
│   └── admin/
│       ├── AdminSidebar.tsx
│       ├── StatsCard.tsx
│       └── DataTable.tsx
├── pages/
│   └── admin/
│       ├── Dashboard.tsx
│       ├── Customers.tsx
│       ├── Sales.tsx
│       └── Finance.tsx
└── styles/
    └── (nutzt existierende index.css)
```

### Module für die Admin App
1. **Kundenmanagement**: Tabellen, Such-/Filterleiste, Detailansichten
2. **Sales**: Charts, Pipeline-Visualisierung, Umsatzkarten
3. **Finanzen**: Übersichten, Transaktionslisten, Reports
4. **Customer Fulfillment**: Status-Tracker, Checklisten, Fortschrittsbalken
