# Momentum Motion Tokens Specification

This document defines the transition timing, scale, fade, and animation tokens for the **Momentum** high-performance theme. Standardizing these behaviors ensures UI feedback is crisp, snappy, and premium.

---

## 1. Timing, Curves & Springs

### Easing Curves
Momentum utilizes CSS transition curves optimized for high-performance visual feedback:
* **`ease-out-expo` (Canonical UI Transition)**:
  - CSS: `cubic-bezier(0.16, 1, 0.3, 1)`
  - Use: Modals, drawer slide-ins, hover transitions, panel shifts.
* **`ease-in-out-sine` (Ambient Animations)**:
  - CSS: `cubic-bezier(0.445, 0.05, 0.55, 0.95)`
  - Use: Breathing glow, pulse rings, loading states.

### React Spring Presets (Framer Motion / React Spring)
For spring physics-based animations, use these constant definitions:
* **`spring-snappy` (Modals, pop-ups)**:
  - Stiffness: `300`
  - Damping: `25`
  - Mass: `0.8`
* **`spring-smooth` (Sidebar collapse, layout shifts)**:
  - Stiffness: `180`
  - Damping: `20`
  - Mass: `1.0`

### Animation Durations
* **Immediate Feedback (`duration-fast`)**: `150ms` (e.g. checkbox state toggle)
* **Standard Component Transition (`duration-normal`)**: `300ms` (e.g. active tab slide highlight)
* **Layout Transition (`duration-slow`)**: `600ms` (e.g. drawer expand, sidebar collapse)
* **Modal / Entrance Transition (`duration-entrance`)**: `800ms` (coupled with `ease-out-expo` for visual reveal)

---

## 2. Micro-Interactions (Scale, Fade & Blur)

### Interactive Scale Modifiers
* **Hover Scale**: `scale: 1.02` (Subtle expansion on buttons, cards, presence avatars)
* **Active Press Scale**: `scale: 0.95` (Tacit feedback on button click, inputs)

### Translucent Fades
* **Card Fade In**: `from: opacity 0, to: opacity 1` (Duration: `duration-normal`, Curve: `ease-out-expo`)
* **Overlay Backdrop**: `from: opacity 0, to: opacity 0.6`

### Backdrop Blurs
* **Modal Overlay Blur**: `backdrop-filter: blur(12px)`
* **Glass Card Blur**: `backdrop-filter: blur(24px)`

---

## 3. Custom Animation Keyframes

### Active Green Pulse (`pulse-green`)
* **Purpose**: Indicates "Focus Mode Active" and presence states on Signal Green tags.
* **Timing**: CSS infinite loop, `2s` duration, `ease-in-out-sine`.
* **Keyframes**:
  ```css
  @keyframes pulse-ring {
    0% { box-shadow: 0 0 0 0 rgba(5, 231, 119, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(5, 231, 119, 0); }
    100% { box-shadow: 0 0 0 0 rgba(5, 231, 119, 0); }
  }
  ```

### Timer Breathing Glow (`timer-breath`)
* **Purpose**: Ambient purple background glow during a focused session to reduce eye strain.
* **Timing**: CSS infinite loop, `8s` duration, `ease-in-out-sine`.
* **Keyframes**:
  ```css
  @keyframes timer-breath {
    0%, 100% { transform: scale(1); opacity: 0.4; }
    50% { transform: scale(1.1); opacity: 0.6; }
  }
  ```

### Flash-then-Settle (`flash-settle`)
* **Purpose**: Highlights new items in the live activity feed before shifting them to standard background colors.
* **Timing**: Single iteration, `2s` duration, `ease-out-expo`.
* **Keyframes**:
  ```css
  @keyframes flash-settle {
    0% { background-color: rgba(5, 231, 119, 0.3); transform: scale(1.02); }
    100% { background-color: transparent; transform: scale(1); }
  }
  ```

### Loading Skeleton Pulse (`skeleton-shimmer`)
* **Purpose**: Placeholder loading states.
* **Timing**: Infinite loop, `1.5s` duration, linear.
* **Keyframes**:
  ```css
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  ```
* **CSS Implementation**:
  ```css
  background: linear-gradient(90deg, #131318 25%, #1C1C24 50%, #131318 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
  ```

---

## 4. Complex Transition Behaviors

### Page Transition (Framer Motion)
* **Behavior**: Slide and fade on mounting new page layouts.
* **Specs**:
  - `initial`: `{ opacity: 0, x: -10 }`
  - `animate`: `{ opacity: 1, x: 0 }`
  - `exit`: `{ opacity: 0, x: 10 }`
  - `transition`: `{ duration: 0.3, ease: "easeOut" }`

### Modal Animation
* **Behavior**: Scaled slide-up overlay animation.
* **Specs**:
  - `initial`: `{ opacity: 0, scale: 0.95, y: 20 }`
  - `animate`: `{ opacity: 1, scale: 1, y: 0 }`
  - `exit`: `{ opacity: 0, scale: 0.95, y: 15 }`
  - `transition`: `{ type: "spring", stiffness: 300, damping: 25 }`

### Drawer Slide-in (Bottom presence drawer)
* **Behavior**: Standard vertical drawer slide-up from bottom boundary.
* **Specs**:
  - `initial`: `{ y: "100%" }`
  - `animate`: `{ y: 0 }`
  - `exit`: `{ y: "100%" }`
  - `transition`: `{ type: "spring", stiffness: 180, damping: 20 }`
