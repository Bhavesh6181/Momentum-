# Momentum Design System - Component Tokens

This document defines the component-level design system tokens for the **Momentum** high-performance study platform. It specifies structural, typography, interactive, stateful, and elevation rules for each core component.

---

## 1. Interactive Inputs & Actions

### Primary Button
* **Description**: Primary action trigger (e.g., "Start Focus Session", "Join Session").
* **Border Radius**: `xl` (`0.5rem` / `8px`)
* **Padding**: Vertical: `1rem` (`16px`), Horizontal: `2.5rem` (`40px`)
* **Typography**: `label-caps` (Inter, Bold 700, 12px, tracking-widest, uppercase)
* **Colors**: 
  - Background: `primary-container` (`#6C5CE7` Kinetic Indigo)
  - Text: `on-primary-container` (`#FAF6FF`)
* **States**:
  - **Default**: Solid Kinetic Indigo background
  - **Hover**: Background `opacity-90`, scale multiplier `1.02`
  - **Active (Press)**: Scale multiplier `0.95`
  - **Disabled**: Background `surface-container-low` (`#1A1B21`), Text `on-surface-variant` (`#C8C4D7`) at 40% opacity, pointer-events none
  - **Focus Ring**: `2px` outline using `primary` (`#C6BFFF`) with a `2px` offset (`#0A0A0D`)
* **Elevation**: Subtle active button shadow (`box-shadow: 0 4px 14px rgba(108, 92, 231, 0.4)`)

### Secondary Button
* **Description**: Secondary acts (e.g., "Reset Timer", "Take Break").
* **Border Radius**: `xl` (`0.5rem` / `8px`)
* **Padding**: Vertical: `0.75rem` (`12px`), Horizontal: `2rem` (`32px`)
* **Typography**: `label-caps` (Inter, Semi-Bold 600, 12px, tracking-wide, uppercase)
* **Colors**:
  - Background: Transparent
  - Border: `1.5px` stroke of `primary/20` (`rgba(198, 191, 255, 0.2)`)
  - Text: `primary` (`#C6BFFF`)
* **States**:
  - **Default**: Ghost with light lavender border
  - **Hover**: Background `primary/5` (`rgba(198, 191, 255, 0.05)`), Border `primary/40` (`rgba(198, 191, 255, 0.4)`)
  - **Active (Press)**: Scale multiplier `0.95`, Background `primary/10`
  - **Disabled**: Border `outline-variant` (`#474554`) at 30% opacity, Text `on-surface-variant/40`, pointer-events none
  - **Focus Ring**: `2px` outline using `primary` with a `2px` offset (`#0A0A0D`)
* **Elevation**: None

### Ghost Button
* **Description**: Low-emphasis tertiary buttons.
* **Border Radius**: `lg` (`0.25rem` / `4px`)
* **Padding**: Vertical: `0.5rem` (`8px`), Horizontal: `1rem` (`16px`)
* **Typography**: `body-sm` (Inter, Regular 400, 14px)
* **Colors**:
  - Background: Transparent
  - Text: `on-surface-variant` (`#C8C4D7`)
* **States**:
  - **Default**: Transparent text
  - **Hover**: Background `surface-container-high` (`#292A30`), Text `on-surface` (`#E3E1EA`)
  - **Active (Press)**: Background `surface-container-highest` (`#33343B`)
  - **Disabled**: Text `on-surface-variant/30`, pointer-events none
  - **Focus Ring**: `1.5px` border outline using `outline` (`#928EA0`)
* **Elevation**: None

### Danger Button
* **Description**: Destructive triggers (e.g., "End Session", "Leave Group").
* **Border Radius**: `xl` (`0.5rem` / `8px`)
* **Padding**: Vertical: `0.75rem` (`12px`), Horizontal: `2rem` (`32px`)
* **Typography**: `label-caps` (Inter, Semi-Bold 600, 12px, tracking-widest, uppercase)
* **Colors**:
  - Background: `error-container/20` (`rgba(147, 0, 10, 0.2)`)
  - Border: `1px` stroke of `error-container/30`
  - Text: `error` (`#FFB4AB`)
* **States**:
  - **Default**: Low-intensity translucent red background
  - **Hover**: Background `error-container/30`
  - **Active (Press)**: Scale multiplier `0.95`, Background `error-container/50`
  - **Disabled**: Background `surface-container-low`, Text `on-surface-variant/30`, Border transparent
  - **Focus Ring**: `2px` outline of `error` (`#FFB4AB`) with a `2px` offset (`#0A0A0D`)
* **Elevation**: None

### Input
* **Description**: Text field entries.
* **Border Radius**: `xl` (`0.5rem` / `8px`)
* **Padding**: Vertical: `0.75rem` (`12px`), Horizontal: `1rem` (`16px`)
* **Typography**: `body-sm` (Inter, Regular 400, 14px)
* **Colors**:
  - Background: `surface-container-low` (`#1A1B21`)
  - Border: `1px` hairline of `white/5` (`rgba(255, 255, 255, 0.05)`)
  - Text: `on-surface` (`#E3E1EA`), Placeholder: `on-surface-variant/40` (`rgba(200, 196, 215, 0.4)`)
* **States**:
  - **Default**: Dark background with low opacity border
  - **Hover**: Border `outline-variant` (`#474554`)
  - **Focus (Active)**: Border `primary` (`#C6BFFF`), Background `surface-container` (`#1E1F26`)
  - **Disabled**: Background `surface-container-lowest` (`#0D0E14`), Text `on-surface-variant/30`, opacity 60%
  - **Focus Ring**: Inline border focus highlight (no extra offset ring)
* **Elevation**: None

### Textarea
* **Description**: Multi-line descriptions (e.g. group goals, challenge descriptions).
* **Border Radius**: `xl` (`0.5rem` / `8px`)
* **Padding**: Vertical: `0.75rem` (`12px`), Horizontal: `1rem` (`16px`)
* **Typography**: `body-sm` (Inter, Regular 400, 14px, leading-relaxed)
* **Colors & Focus Rules**: Matches **Input** specs exactly. Minimum height: `120px`.

### Select
* **Description**: Dropdowns (e.g., college selection list, metric options).
* **Border Radius**: `xl` (`0.5rem` / `8px`)
* **Padding**: Vertical: `0.75rem` (`12px`), Horizontal: `1rem` (`16px`)
* **Typography**: `body-sm` (Inter, Regular 400, 14px)
* **Colors**: Matches **Input** specs. Contains custom dropdown arrow icon styled using `on-surface-variant` (`#C8C4D7`).
* **States**: Matches **Input** specs. Option popover items use `surface-container-high` (`#292A30`) with hovers styled as `primary/10`.

### Checkbox
* **Description**: Selection boxes (e.g. task items).
* **Border Radius**: `lg` (`0.25rem` / `4px`)
* **Dimensions**: Width: `1.25rem` (`20px`), Height: `1.25rem` (`20px`)
* **Colors**:
  - Background: `surface-container-low` (`#1A1B21`)
  - Border: `1px` border of `outline-variant` (`#474554`)
* **States**:
  - **Default**: Empty dark box
  - **Checked**: Background `primary-container` (`#6C5CE7`), Border `primary-container`, displays checkmark icon in `on-primary-container` (`#FAF6FF`)
  - **Hover**: Border `primary` (`#C6BFFF`)
  - **Disabled**: Background `surface-container-lowest`, opacity 40%
  - **Focus Ring**: `2px` outline using `primary` with a `2px` offset (`#0A0A0D`)
* **Elevation**: None

### Toggle (Switch)
* **Description**: Switch controls (e.g., break mode vs studying).
* **Border Radius**: `full` (`9999px`)
* **Dimensions**: Track Width: `2.75rem` (`44px`), Track Height: `1.5rem` (`24px`), Knob Diameter: `1rem` (`16px`)
* **Colors**:
  - Track Background (Off): `surface-container-high` (`#292A30`)
  - Track Background (On): `primary-container` (`#6C5CE7`)
  - Knob Color: `on-surface` (`#E3E1EA`)
* **States**:
  - **Default (Off)**: Dark track, knob positioned left (`4px` padding)
  - **Active (On)**: Indigo track, knob slides right (`translate-x-[20px]`)
  - **Hover**: Track border highlights using `outline` (`#928EA0`)
  - **Disabled**: Opacity 40%
  - **Focus Ring**: `2px` outline of `primary` around track

---

## 2. Structural & Layout Containers

### Card
* **Description**: Standard dashboards and widget containers.
* **Border Radius**: `xl` (`0.5rem` / `8px`)
* **Padding**: `1.5rem` (`24px`) or `2rem` (`32px`)
* **Typography**: Title: `headline-md` (Inter 600, 20px), Body: `body-sm` (Inter 400, 14px)
* **Colors**:
  - Background: `surface` (`#121319`)
  - Border: `1px` hairline of `white/8` (`rgba(255, 255, 255, 0.08)`)
* **States**: None (Static container)
* **Elevation**: None

### Glass Card
* **Description**: Featured widgets (e.g. active study rooms, focus graphs).
* **Border Radius**: `xl` (`0.5rem` / `8px`)
* **Padding**: `2rem` (`32px`)
* **Colors**:
  - Background: `surface/80` (`rgba(18, 19, 25, 0.8)`)
  - Border: `1px` gradient border starting top-left: `white/12` (`rgba(255, 255, 255, 0.12)`), fading bottom-right to transparent.
* **Backdrop Filter**: `blur(24px)`
* **Elevation**: Soft black drop shadow (`box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4)`)

### Modal
* **Description**: Focus settings, detail displays.
* **Border Radius**: `xl` (`0.5rem` / `8px`)
* **Padding**: `2.5rem` (`40px`)
* **Colors**:
  - Background: `surface-container-high` (`#292A30`)
  - Border: `1px` border of `white/12` (`rgba(255,255,255,0.12)`)
* **Backdrop Filter**: Backdrop overlay uses `surface-container-lowest/60` with `blur(12px)`.
* **Elevation**: Prominent modal shadow (`box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6)`)

### Drawer
* **Description**: Collapsible content panels (e.g., studying friends bottom drawer).
* **Border Radius**: Top-left & Top-right: `xl` (`0.5rem` / `8px`)
* **Padding**: Vertical: `1rem` (`16px`), Horizontal: `2rem` (`32px`)
* **Colors**:
  - Background: `surface-container-lowest/80` (`rgba(13, 14, 20, 0.8)`)
  - Border: Top border: `1px` of `outline-variant/30`
* **Backdrop Filter**: `blur(24px)`
* **Elevation**: `box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.3)`

### Sidebar (Navigation)
* **Description**: Primary navigation panel.
* **Width**: `16rem` (`256px`)
* **Border Radius**: None (Full height)
* **Padding**: Vertical: `2rem` (`32px`), Horizontal: `1rem` (`16px`)
* **Colors**:
  - Background: `surface` (`#121319`)
  - Border: Right border: `1px` border of `white/10`
* **Elevation**: None

### Navbar (Header)
* **Description**: Top stats & settings panel.
* **Height**: `5rem` (`80px`)
* **Padding**: Horizontal: `3rem` (`48px`) (desktop), `1rem` (`16px`) (mobile)
* **Colors**:
  - Background: `background` (`#0A0A0D`)
  - Border: Bottom border: `1px` border of `white/10`
* **Elevation**: None

---

## 3. Data & Status Indicators

### Avatar
* **Description**: Student profile photo.
* **Border Radius**: `full` (`9999px`)
* **Dimensions**: 
  - Standard: `2.5rem` (`40px`) x `2.5rem` (`40px`)
  - Large: `5rem` (`80px`) x `5rem` (`80px`)
* **Colors**: Border: `1.5px` border of `white/10` (active/user avatar uses `primary` (`#C6BFFF`) border)

### Badge
* **Description**: Status/Achievement flag (e.g. streaks, focus levels).
* **Border Radius**: `lg` (`0.25rem` / `4px`)
* **Padding**: Vertical: `0.25rem` (`4px`), Horizontal: `0.75rem` (`12px`)
* **Typography**: `label-caps` (Inter, Bold 700, 10px, tracking-wider, uppercase)
* **Colors**:
  - Streak/Active: Background: `secondary-container/10` (`rgba(5, 231, 119, 0.1)`), Text: `secondary-fixed-dim` (`#00E475`), Border: `1px` of `secondary/20`
  - High Achievement: Background: `primary-container/10` (`rgba(108, 92, 231, 0.1)`), Text: `primary` (`#C6BFFF`), Border: `1px` of `primary/20`

### Tooltip
* **Description**: Hover instruction descriptions.
* **Border Radius**: `lg` (`0.25rem` / `4px`)
* **Padding**: Vertical: `0.5rem` (`8px`), Horizontal: `0.75rem` (`12px`)
* **Typography**: `body-sm` (Inter, Regular 400, 12px)
* **Colors**:
  - Background: `surface-container-highest` (`#33343B`)
  - Text: `on-background` (`#E3E1EA`)
* **Elevation**: `box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3)`

### Toast
* **Description**: Floating task action messages.
* **Border Radius**: `xl` (`0.5rem` / `8px`)
* **Padding**: Vertical: `1rem` (`16px`), Horizontal: `1.5rem` (`24px`)
* **Typography**: `body-sm` (Inter, Medium 500, 14px)
* **Colors**:
  - Background: `surface-container-high` (`#292A30`)
  - Border: `1px` stroke of `primary/20` (Kinetic Toast) or `secondary/20` (Success/Completion Toast)
* **Elevation**: Toast shadow (`box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5)`)

### Progress Bar
* **Description**: Category focus completion metrics.
* **Height**: `0.375rem` (`6px`)
* **Border Radius**: `full` (`9999px`)
* **Colors**:
  - Track Background: `surface-container` (`#1E1F26`)
  - Fill Background: `primary-container` (`#6C5CE7`) or `secondary-container` (`#05E777`)

### Timer Ring
* **Description**: Main countdown visualization in Focus Mode.
* **Dimensions**: Diameter `24rem` (`384px`), Stroke width `8px`
* **Colors**:
  - Empty Track: `white/5` (`rgba(255, 255, 255, 0.05)`)
  - Active Fill: `secondary-fixed-dim` (`#00E475` / Neon Green)
* **Visual Treatment**: Rounded stroke endpoints, central numerical display inside the ring.

---

## 4. Specialized Dashboard Cards

### Leaderboard Card
* **Description**: Individual ranks list table row/card.
* **Border Radius**: `xl` (`0.5rem` / `8px`) (when highlighted), static rows use plain divisions
* **Padding**: Vertical: `1.5rem` (`24px`), Horizontal: `2rem` (`32px`)
* **Typography**: Candidate Name: `body-lg` (Inter, Bold 700), Rank/Points: `stats-md` (JetBrains Mono, Medium 500, 18px)
* **Colors**:
  - Default Row: Transparent background, bottom divider `1px` of `white/5`
  - Highlighting User Row (You): Background `primary/5` (`rgba(198, 191, 255, 0.05)`), border `1px` of `primary/30`

### Analytics Card
* **Description**: Bento stats metrics card.
* **Border Radius**: `xl` (`0.5rem` / `8px`)
* **Padding**: `1.5rem` (`24px`)
* **Typography**: Metric Label: `label-caps` (Inter, 12px, tracking-widest), Metric Value: `display-lg` (Inter, Bold 700, 48px, tabular-nums)
* **Colors**: Matches **Glass Card** or **Card** depending on importance. Bottom element includes small SVG sparklines or mini histograms representing 7-day focus values.
