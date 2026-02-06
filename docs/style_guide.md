
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

### 8. Animations & Interactions

**This is what transforms "good" into "Pro Max".**

#### Micro-Interactions

**Button Interactions**
```css
/* Hover Effects */
- Scale up: transform: scale(1.02)
- Lift: box-shadow elevation + translateY(-2px)
- Ripple: Radial gradient animation from click point
- Glow: Outer glow on hover (box-shadow with color)
- Border beam: Animated gradient border (Linear-style)

/* Timing */
- Duration: 150-300ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
```

**Input Focus States**
```css
/* Focus Glow */
- Ring: 2-4px outline with brand color at 50% opacity
- Glow: Soft box-shadow with brand color
- Border shift: Border color change + subtle scale
- Label float: Animated label moving up on focus

/* Accessibility */
- Always visible focus indicators
- Minimum 3px outline width
- High contrast (3:1 ratio)
```

**Card Hover Effects**
```css
/* Premium Card Interactions */
- Lift + Shadow: translateY(-4px) + shadow increase
- Tilt: 3D perspective tilt on hover (subtle, 2-3deg)
- Glow border: Animated gradient border reveal
- Content reveal: Hidden content slides in on hover
- Image zoom: Scale image 1.05x inside container
```

#### Scroll Animations

**Reveal on Scroll**
```jsx
// Staggered Entrance
- Fade up: opacity 0→1 + translateY(20px→0)
- Stagger delay: 100ms between elements
- Trigger: When element is 20% in viewport
- Duration: 600ms
- Easing: ease-out
```

**Parallax Effects**
```jsx
// Layered Depth
- Hero background: Scroll speed 0.5x
- Foreground elements: Scroll speed 1.2x
- Subtle only: Max 20-30px movement
- Performance: Use transform, not position
```

**Progress Indicators**
```css
/* Reading Progress */
- Top bar: Fixed position, width based on scroll %
- Circular: SVG circle with stroke-dashoffset
- Smooth: transition: width 100ms linear
```

#### Page Transitions

**Route Changes**
```css
/* Smooth Navigation */
- Fade: opacity transition 200ms
- Slide: translateX(-100%→0) 300ms
- Blur: filter: blur(0→10px→0)
- Crossfade: Overlap old/new content
```

**Modal/Dialog Animations**
```css
/* Entrance */
- Backdrop: opacity 0→1 (200ms)
- Content: scale(0.95→1) + opacity 0→1 (300ms)
- Stagger: Backdrop first, then content

/* Exit */
- Reverse animation
- Faster duration (200ms)
```

#### Loading States

**Skeleton Loaders**
```css
/* Content Placeholders */
- Shimmer effect: Linear gradient animation
- Shape matching: Match final content layout
- Color: Light grey (#E5E7EB) on white
- Animation: 1.5s infinite ease-in-out
```

**Spinners & Progress**
```css
/* Loading Indicators */
- Spinner: Rotating circle with gradient
- Progress bar: Indeterminate animation
- Pulse: Scale + opacity animation
- Duration: 1-2s infinite
```

#### Advanced Effects

**Beams & Glows** (Linear/Vercel Style)
```css
/* Border Beams */
- Animated gradient border
- Conic gradient rotation
- Subtle glow effect
- Use for: CTAs, featured cards, premium elements

/* Implementation */
background: linear-gradient(90deg, transparent, #3B82F6, transparent);
animation: beam 2s infinite;
```

**Mesh Gradients**
```css
/* Animated Backgrounds */
- Multi-color gradient mesh
- Slow hue rotation (60s+)
- Blur for organic feel
- Use for: Hero sections, backgrounds
```

**Glassmorphism Blur**
```css
/* Glass Effect */
backdrop-filter: blur(10px) saturate(180%);
background: rgba(255, 255, 255, 0.1);
border: 1px solid rgba(255, 255, 255, 0.2);
```

#### Animation Performance Rules

```
✅ DO:
- Use transform and opacity (GPU accelerated)
- Set will-change for animated elements
- Use requestAnimationFrame for JS animations
- Debounce scroll events
- Prefer CSS animations over JS when possible
- Test on low-end devices

❌ DON'T:
- Animate width, height, or position
- Use animations longer than 500ms for interactions
- Animate during user input (blocks interaction)
- Use too many simultaneous animations
- Forget prefers-reduced-motion media query
- Animate on scroll without throttling
```

#### Accessibility Considerations

```css
/* Respect User Preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

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

---

## 🚫 Anti-Patterns: Was zu VERMEIDEN ist

**Explizit kommunizieren was NICHT getan werden soll:**

### Design Anti-Patterns

```
❌ Flash Over Function
- Keine Animationen die User-Aktionen blockieren
- Keine Transitions länger als 300ms für Interaktionen
- Keine auto-playing Videos mit Sound
- Infinite Scroll ohne Pagination-Option

❌ Low Contrast Crimes
- Kein helles Grau (#CCC) auf weißem Hintergrund
- Kein reines Weiß auf reinem Schwarz (zu hart)
- WCAG AA Minimum sicherstellen (4.5:1 für Text)
- Mit Farbenblindheits-Simulatoren testen

❌ Over-Cluttered Chaos
- Nicht mehr als 3 Primärfarben
- Nicht mehr als 2 Font-Familien
- Nicht mehr als 5 Font-Größen in einer View
- Kein inkonsistentes Spacing (8px Grid System nutzen)

❌ Mystery Meat Navigation
- Icons müssen Labels oder Tooltips haben
- Keine Hamburger-Menüs auf Desktop
- Keine versteckte Navigation ohne klare Affordance
- Keine "clevere" Navigation die User verwirrt

❌ Mobile Hostility
- Keine winzigen Tap-Targets (Minimum 44x44px)
- Kein horizontales Scrollen (außer bei Carousels)
- Keine hover-abhängigen Interaktionen auf Touch
- Keine Fixed-Elemente die Content verdecken

❌ Performance Sins
- Keine unoptimized Images (WebP, Lazy Loading nutzen)
- Keine render-blocking Resources
- Keine Layout Shifts (CLS > 0.1)
- Keine schweren Animationen beim Page Load
```

### UX Anti-Patterns

```
❌ Form Frustrations
- Keine Labels innerhalb von Inputs (Accessibility Issue)
- Kein "Clear All" ohne Bestätigung
- Keine Validation nur beim Submit
- Keine disabled Submit-Buttons (stattdessen Errors zeigen)

❌ Content Crimes
- Keine Textwände ohne Hierarchie
- Keine auto-playing Carousels (User verpassen Content)
- Keine "click here" Links (nicht deskriptiv)
- Kein Lorem Ipsum in Production

❌ Accessibility Failures
- Keine Keyboard-Navigation-Traps
- Kein fehlender Alt-Text bei Bildern
- Keine nur-auf-Farbe-basierende Informationsvermittlung
- Kein Auto-Focus beim Page Load (außer Search)
```

