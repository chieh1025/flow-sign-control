# Flow Page — Design Overrides

> Overrides `MASTER.md` for the Flow Diagram page (`/flow`).

---

## Toolbar

- **Glassmorphism container**: `bg-surface/70 backdrop-blur-md border-border/60 shadow-lg rounded-xl`
- Buttons inside toolbar: no individual borders/shadows, just hover bg change
- Separators between button groups: `w-px h-5 bg-border`
- Edit mode toggle: active state uses `bg-primary text-white`

## Canvas

- **Default (view mode)**: `bg-background`, grid dots use `var(--border)`
- **Edit mode**: canvas tints to `bg-primary-bg/30`, grid dots use `var(--primary)` at 15% opacity, size 1.5
- Bottom center floating pill: "編輯模式" indicator with `bg-primary/10 border-primary/20 text-primary`

## Nodes (ProcessNode)

- **Hover feedback**: `hover:shadow-md hover:border-primary/40` with `transition-all duration-150`
- **cursor**: always `cursor-pointer`
- **Selected state**: `ring-2 ring-primary/60 ring-offset-1 ring-offset-background shadow-md`
- **Badge opacity**: bg colors use `/80` in light, `/30` in dark for subtlety
- **Font sizes**: label `text-[13px] font-medium`, approval `text-[11px]`, badge `text-[10px]`
- **Handles**: `!w-2 !h-2` (smaller than before), `!border-[1.5px]`

## Node Type Styles

| Type | Shape | Border | Light BG | Dark BG |
|------|-------|--------|----------|---------|
| Start | `rounded-3xl` | emerald-400/500 | emerald-50/80 | emerald-950/40 |
| End | `rounded-3xl` | orange-400/500 | orange-50/80 | orange-950/40 |
| Task | `rounded-lg` | border (CSS var) | surface | surface |
| Decision | `rounded-lg` | violet-400/500 | violet-50/60 | violet-950/30 |
| Connector | `rounded-full` | amber-400/500 | amber-50/80 | amber-950/40 |

## Edge Options

- `strokeWidth: 1.5` (was 2)
- Arrow: `width: 14, height: 14` (was 16)

## MiniMap

- `!bg-surface/80 !backdrop-blur-sm !border-border !rounded-lg !shadow-lg`
- `maskColor: rgba(0,0,0,0.1)`

## Anti-Patterns for Flow Page

- No layout-shifting hover on nodes (no scale transforms)
- No z-index: 9999 — use z-10 for toolbar
- Toolbar must not overlap nodes on initial fitView
