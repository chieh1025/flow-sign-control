# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** FSC 流程核決控制平台
**Updated:** 2026-03-25
**Style:** Professional Dual-Mode (Light default + Dark toggle)
**Tech Stack:** Next.js 16 + Tailwind 4 + React Flow + Zustand
**Theme:** CSS variables in `globals.css`, toggled via `next-themes`

---

## Global Rules

### Color Palette — CSS Variables

#### Light Mode (:root)

| Role | Variable | Hex | Usage |
|------|----------|-----|-------|
| BG | `--bg` | `#F8FAFC` | Page background |
| Surface | `--surface` | `#FFFFFF` | Cards, panels |
| Surface Hover | `--surface-hover` | `#F1F5F9` | Hover states |
| Border | `--border` | `#E2E8F0` | Borders, dividers |
| Border Light | `--border-light` | `#F1F5F9` | Subtle dividers |
| Text | `--text` | `#0F172A` | Primary text |
| Text Secondary | `--text-secondary` | `#64748B` | Secondary text |
| Text Muted | `--text-muted` | `#94A3B8` | Muted/placeholder |
| Primary | `--primary` | `#3B82F6` | Active, links, CTA |
| Primary BG | `--primary-bg` | `#EFF6FF` | Primary tint |
| Primary Hover | `--primary-hover` | `#2563EB` | Hover |
| Sidebar BG | `--sidebar` | `#FFFFFF` | Sidebar |
| Sidebar Border | `--sidebar-border` | `#E2E8F0` | Sidebar border |

#### Dark Mode (.dark)

| Role | Variable | Hex | Usage |
|------|----------|-----|-------|
| BG | `--bg` | `#0B1120` | Page background |
| Surface | `--surface` | `#131B2E` | Cards, panels |
| Surface Hover | `--surface-hover` | `#1C2640` | Hover states |
| Border | `--border` | `#1E293B` | Borders, dividers |
| Border Light | `--border-light` | `#1E293B` | Subtle dividers |
| Text | `--text` | `#F1F5F9` | Primary text |
| Text Secondary | `--text-secondary` | `#94A3B8` | Secondary text |
| Text Muted | `--text-muted` | `#64748B` | Muted/placeholder |
| Primary | `--primary` | `#60A5FA` | Active, links, CTA |
| Primary BG | `--primary-bg` | `#1E3A5F` | Primary tint |
| Primary Hover | `--primary-hover` | `#3B82F6` | Hover |
| Sidebar BG | `--sidebar` | `#0F172A` | Sidebar |
| Sidebar Border | `--sidebar-border` | `#1E293B` | Sidebar border |

### Semantic Colors (Shared)

| Role | Light | Dark | Usage |
|------|-------|------|-------|
| Success | `#16A34A` | `#4ADE80` | Approved, start nodes |
| Warning | `#D97706` | `#FBBF24` | Unsigned, review |
| Error | `#DC2626` | `#F87171` | Vacant, missing |
| Info | `#2563EB` | `#60A5FA` | System, blue states |
| Purple | `#7C3AED` | `#A78BFA` | Decisions, permissions |
| Orange | `#EA580C` | `#FB923C` | End nodes, alerts |
| Amber | `#D97706` | `#FCD34D` | Connectors, comments |

### Node Type Colors

| Type | Border | Light BG | Dark BG |
|------|--------|----------|---------|
| Start | green-500 | green-50 | green-950 |
| End | orange-500 | orange-50 | orange-950 |
| Task | blue-500 | white / surface | gray-800 |
| Decision | purple-500 | purple-50 | purple-950 |
| Connector | amber-500 | amber-50 | amber-950 |

### Layout

| Token | Value |
|-------|-------|
| Sidebar (expanded) | `208px` (w-52) |
| Sidebar (collapsed) | `64px` (w-16) |
| Border Radius | `8px` (rounded-lg) |
| Page Padding | `24px` (p-6) |
| Card Padding | `20px` (p-5) |
| Gap | `16px` (gap-4) |

### Typography

- **Font:** Geist Sans (already configured)
- **Body size:** 14px (text-sm for data-dense UI)
- **Heading weight:** 600-700
- **Font size hierarchy:** label 13px > body 12px > meta 11px > badge 10px

---

## Interaction Patterns (ui-ux-pro-max)

### Hover Feedback
- All interactive elements must have `cursor-pointer`
- Cards/nodes: `hover:shadow-md hover:border-primary/40` with `transition-all duration-150`
- Buttons: `hover:bg-surface-hover hover:text-text`
- No scale transforms (避免 layout shift)

### Floating Toolbars
- Glassmorphism: `bg-surface/70 backdrop-blur-md border-border/60 shadow-lg rounded-xl`
- Button groups separated by `w-px h-5 bg-border` dividers
- Active state: `bg-primary text-white`
- z-index: use z-10, never z-[9999]

### Edit Mode Visual Cues
- Canvas background tints: `bg-primary-bg/30`
- Grid dots change to primary color at lower opacity
- Bottom center pill indicator: `bg-primary/10 border-primary/20 text-primary`

### Color Opacity Convention
- Light mode semantic bg: use `/80` (e.g., `bg-emerald-50/80`)
- Dark mode semantic bg: use `/30`~`/40` (e.g., `dark:bg-emerald-950/40`)
- This keeps node backgrounds subtle and non-competing with text

### MiniMap
- `!bg-surface/80 !backdrop-blur-sm !border-border !rounded-lg !shadow-lg`

---

## Anti-Patterns

- No hardcoded background/text colors — use CSS variables via dark: classes
- No missing `dark:` counterparts when using color classes
- No emojis as icons — use lucide-react
- No layout-shifting hover effects (no scale transforms)
- Transitions: 150-200ms for all interactive states
- No arbitrary z-index (9999) — use defined scale (10, 20, 30, 50)
- No hover-only interactions — critical actions must be click/tap accessible

---

## Pre-Delivery Checklist

- [ ] Every `bg-*` has a `dark:bg-*` counterpart (or uses CSS variable class)
- [ ] Every `text-*` has a `dark:text-*` counterpart (or uses CSS variable class)
- [ ] Every `border-*` has a `dark:border-*` counterpart (or uses CSS variable class)
- [ ] Theme toggle works in sidebar
- [ ] All pages render correctly in both modes
- [ ] React Flow canvas adapts to theme
- [ ] No FOUC (flash of unstyled content) on load
- [ ] All clickable elements have `cursor-pointer`
- [ ] Hover states with smooth transitions (150ms)
- [ ] Focus states visible for keyboard navigation
- [ ] Floating toolbars use glassmorphism pattern
- [ ] Edit mode has clear visual indicator on canvas
