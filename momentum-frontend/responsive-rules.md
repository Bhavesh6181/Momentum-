# Momentum Responsive Layout, Iconography & Layering Specification

This document defines the responsive layout rules, iconography specifications, and layering (z-index) constraints for the **Momentum** high-performance study platform.

---

## 1. Responsive Layout Rules

Momentum enforces a consistent spatial layout system across five distinct viewport sizes:

| Breakpoint | Viewport Width | Max Container Width | Grid Columns | Sidebar State | Card Spacing (`gap`) | Side Margins |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Mobile (`sm`)** | `< 640px` | Full width (`100%`) | `4` columns | Hidden (Slide Drawer) | `1rem` (`16px`) | `1rem` (`16px`) |
| **Tablet (`md`)** | `640px` to `1024px` | Full width | `8` columns | Collapsed (Icon Bar) | `1.5rem` (`24px`) | `2rem` (`32px`) |
| **Laptop (`lg`)** | `1024px` to `1280px`| `960px` | `12` columns | Expanded (`256px`) | `1.5rem` (`24px`) | `3rem` (`48px`) |
| **Desktop (`xl`)** | `1280px` to `1536px`| `1200px` | `12` columns | Expanded (`256px`) | `1.5rem` (`24px`) | `3rem` (`48px`) |
| **Ultra-wide (`2xl`)**| `>= 1536px` | `1440px` | `12` columns | Expanded (`256px`) | `2rem` (`32px`) | `4rem` (`64px`) |

### Sidebar Collapse & Width Rules
* **Expanded State (`lg` and above)**: Fixed width `16rem` (`256px`), sticks to the left side of the viewport, pushes page content (`margin-left: 256px`).
* **Collapsed State (`md` to `lg`)**: Fixed width `5rem` (`80px`), content margin matches (`margin-left: 80px`), displays navigation links as center-aligned icon-only buttons.
* **Hidden State (Below `md`)**: Width `0`, content margin collapses to `0`, navigation becomes accessible via a slide-in bottom drawer or floating hamburger menu toggle.

### Dashboard Layout Model
* **Grid Structure**: Fluid 12-column flexbox or CSS Grid. 
* **Asymmetric Layouts**:
  - Main area (e.g. active focus timers, charts): Occupies `8` columns on laptop/desktop.
  - Side area (e.g. metrics feed, stats bento cards): Occupies `4` columns.
  - On viewports below `lg`, this collapses into a vertical single-column stack (main elements stack above side panels).

---

## 2. Iconography Standards

Momentum uses **Lucide React** (standardized package wrapper for Lucide icons) for all functional indicators.

### Icon Design Constraints
* **Stroke Weight**: Standardized to `1.5px` (consistent with the brand's delicate corporate look). Avoid default `2px` weights.
* **Coloration**: Monochromatic (`on-surface-variant` / `#C8C4D7` at 60% opacity) in default state. Accent colored (`primary` or `secondary`) on hover or active navigation tab highlight.

### Default Icon Sizing Scale
* **Tiny (`size-sm`)**: `0.875rem` (`14px`) — Use: Inline indicators, small status flags (e.g., trend directions).
* **Standard (`size-md`)**: `1.25rem` (`20px`) — Use: Sidebar nav, header icons, card title icons, list controls.
* **Large (`size-lg`)**: `1.5rem` (`24px`) — Use: Large dashboard header actions, primary button icons.
* **Display Timer (`size-xl`)**: `2.5rem` (`40px`) — Use: Focus mode active control panel triggers.

### Component Avatar Sizing (Standardized)
* **Standard Profile Avatar**: `2.5rem` (`40px`) x `2.5rem` (`40px`) (Header, leaderboard rows, presence lists).
* **Presence Overlay Indicator**: `0.75rem` (`12px`) dot positioned bottom-right with a `2px` border matching the surrounding card surface.

---

## 3. Layering (Z-index) Scale

To manage layering of structural elements, notifications, and interactive overlays, Momentum utilizes a unified z-index scale:

| Token Name | Z-index Value | Core Component / Purpose |
| :--- | :--- | :--- |
| **`z-base`** | `0` | Default body elements, layout cards, backgrounds |
| **`z-sticky-header`**| `40` | Navbar (`Navbar.tsx`) sticky header navigation |
| **`z-sidebar`** | `50` | Sidebar navigation panel (`Sidebar.tsx`) |
| **`z-drawer`** | `100` | Collapsible presence lists and slide-in trays |
| **`z-modal`** | `200` | Pop-up overlay content dialogs and forms |
| **`z-popover`** | `300` | Select dropdown panels and context menus |
| **`z-tooltip`** | `400` | Text/label hover explanations |
| **`z-toast`** | `500` | Top-level alert alerts and message trays |

*Constraint: Ensure that all modal dialog overlays block document scrolls using layout overflow locks when active.*
