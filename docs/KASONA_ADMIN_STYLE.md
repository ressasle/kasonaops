# Kasona Admin Style Guide

## Brand Foundation
- Mission: premium operations tooling with clarity and confidence.
- Visual direction: cosmic dark, glass surfaces, warm highlights.

## Color System (HSL vars)
```css
--background: 240 7% 3%;
--foreground: 0 0% 100%;
--card: 0 0% 100% / 0.03;
--border: 0 0% 100% / 0.08;
--primary: 33 100% 58%;
--secondary: 195 91% 78%;
--kasona-yellow: 48 100% 67%;
--destructive: 342 90% 67%;
```

## Typography
- Headlines: Playfair Display (italic)
- Body/UI: Montserrat
- Data/labels: Space Mono

## Components
- Glass Panel: translucent card with blur and thin border
- Stats Card: mono label, large value, delta line
- Data Table: zebra rows, subtle borders, mono headers
- Slider: thick track, glowing thumb, mono labels

## Layout Patterns
- Left sidebar navigation, fixed width
- Header with global search + quick actions
- 12-column grid for dashboard sections
- KPI cards in a 3 or 4-up row

## Motion
- `fade-in` for sections
- `glow-pulse` for primary CTAs
- `spin-slow` for loading states

## Iconography
- Lucide icons recommended
- Sizes: 16/20/32 px

## Admin Modules
- Customers (CRM table + detail drawer)
- Sales (pipeline + conversion metrics)
- Operations (fulfillment tracker + QA)
- Tasks (kanban + due dates)
