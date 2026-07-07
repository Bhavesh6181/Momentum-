# Design Tokens (Kinetic Dark Theme)

This document is the human-readable single source of truth for the **Momentum** design system tokens. All color values, font sizing, border radii, and spacing variables are unified and consolidated from the canonical mockups.

## Colors

### Canvas & Surfaces
* **Primary Canvas Background (`background`)**: `#0A0A0D` (Normalized from `#121319`, `#0D0E14`, and `#0A0A0D`)
* **Surface Background (`surface`)**: `#121319` (Main card and component background)
* **Surface Dim (`surface-dim`)**: `#0A0A0D`
* **Surface Bright (`surface-bright`)**: `#383940`

### Surface Containers (Data Density & Layering)
* **Lowest Container (`surface-container-lowest`)**: `#0D0E14`
* **Low Container (`surface-container-low`)**: `#1A1B21`
* **Medium Container (`surface-container`)**: `#1E1F26`
* **High Container (`surface-container-high`)**: `#292A30`
* **Highest Container (`surface-container-highest`)**: `#33343B`

### Primary Accent (Kinetic Indigo)
* **Indigo Accent Light (`primary`)**: `#C6BFFF`
* **Indigo Accent Main (`primary-container`)**: `#6C5CE7` (Used for primary buttons, focus highlights)
* **On-Primary Text (`on-primary`)**: `#2900A0`
* **On-Primary Container Text (`on-primary-container`)**: `#FAF6FF`

### Secondary Accent (Signal Green)
* **Green Accent Light (`secondary`)**: `#7DFFA2` (Normalized from `#7DFFA2` and `#00FF94`)
* **Green Accent Main (`secondary-container`)**: `#05E777`
* **Signal Green Active (`secondary-fixed-dim`)**: `#00E475` (Used for active timer states, pulses, and success streaks)
* **Indicator Green (`signal-green`)**: `#00E676`

### Typography & Structure
* **Primary Text (`on-background` / `on-surface`)**: `#E3E1EA`
* **Secondary/Metadata Text (`on-surface-variant`)**: `#C8C4D7`
* **Outline / Borders (`outline`)**: `#928EA0`
* **Outline / Divider Hairlines (`outline-variant`)**: `#474554`

---

## Typography

### Font Families
* **Primary (Headlines, Body, Labels)**: `Inter`, fallback `sans-serif`
* **Monospace (Numerical metrics, Timers)**: `JetBrains Mono`, fallback `monospace`

### Font Scale
| Token | Font Family | Size | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display-lg` | Inter | 48px | Bold (700) | 1.1 | -0.04em |
| `headline-lg` | Inter | 32px | Bold (700) | 1.2 | -0.02em |
| `headline-lg-mobile` | Inter | 24px | Bold (700) | 1.2 | -0.02em |
| `headline-md` | Inter | Semi-Bold (600) | 20px | 1.4 | -0.01em |
| `body-lg` | Inter | 16px | Regular (400) | 1.6 | 0em |
| `body-sm` | Inter | 14px | Regular (400) | 1.5 | 0em |
| `label-caps` | Inter | 12px | Semi-Bold (600) | 1.0 | 0.05em (caps) |
| `stats-md` | JetBrains Mono | 18px | Medium (500) | 1.0 | 0em |

*Note: In `focus-mode-active.html`, a utility `display-lg` variation of `96px` is used specifically for the active countdown clock display.*

---

## Spacing Grid (8px Base Scale)
* **Unit Grid (`unit`)**: `8px`
* **Mobile Margin (`margin-mobile`)**: `16px`
* **Column Gutter (`gutter`)**: `24px`
* **Desktop Margin (`margin-desktop`)**: `48px`
* **Section Gap (`section-gap-v`)**: `80px`

---

## Shapes & Radii
* **Checkpoint/Tag rounding (`DEFAULT`)**: `0.125rem` (2px)
* **Button/Input rounding (`lg`)**: `0.25rem` (4px)
* **Card/Container rounding (`xl`)**: `0.5rem` (8px)
* **Full pill rounding (`full`)**: `9999px` (9999px, normalized from `0.75rem` / `100px` to standard utility behavior)

---

## Custom Shadow & Glow Effects
* **Hairline Outline**: `1px solid rgba(255,255,255,0.08)` (Used to define Obsidian card elements)
* **Primary Card Gradient Border**:
  ```css
  border: 1px solid transparent;
  background: linear-gradient(#131318, #131318) padding-box,
              linear-gradient(to bottom right, rgba(255, 255, 255, 0.12), transparent) border-box;
  ```
* **Timer Glow**: `box-shadow: 0 0 15px -5px rgba(198, 191, 255, 0.2)`
* **Active Green Pulse Glow**: `box-shadow: 0 0 0 10px rgba(5, 231, 119, 0)` (Animates scale / opacity drop)
