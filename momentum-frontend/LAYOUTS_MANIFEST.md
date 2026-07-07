# Momentum Layout Shells Manifest

This manifest documents the React structural layout wrappers (`Layouts`) used to define navigation, sidebar visibility, backdrop filters, and overlay states.

---

## 1. `AuthLayout`
* **Description**: Centered auth card layout. Monochromatic dark canvas background with faint geometric shapes. No sidebar nav.
* **Child Screens**:
  - `auth-create-account.html` (`/signup`)
  - `auth-sign-in.html` (`/signin`)
  - Forgot and Reset password pages
* **Structural Outline**:
  ```
  ┌──────────────────────────────────────────┐
  │                                          │
  │               ┌──────────┐               │
  │               │   Auth   │               │
  │               │   Card   │               │
  │               └──────────┘               │
  │                                          │
  └──────────────────────────────────────────┘
  ```

---

## 2. `OnboardingLayout`
* **Description**: Centered wizard card flow. Top section contains a linear step progress indicator. No sidebars.
* **Child Screens**:
  - `onboarding-college-selection.html` (`/onboarding/college`)
  - `onboarding-career-goals.html` (`/onboarding/goals`)
  - `onboarding-branch-and-year.html` (`/onboarding/academic`)
  - `onboarding-social-links.html` (`/onboarding/social`)
  - `onboarding-profile-picture.html` (`/onboarding/avatar`)
* **Structural Outline**:
  ```
  ┌──────────────────────────────────────────┐
  │         [ Step 1 == Step 2 -- Step 3 ]   │
  │               ┌──────────┐               │
  │               │WizardStep│               │
  │               │   Card   │               │
  │               └──────────┘               │
  │                                          │
  └──────────────────────────────────────────┘
  ```

---

## 3. `MainLayout`
* **Description**: The default application layout. Features an expanded Left Sidebar (`256px`), Top Navigation Header, and fluid scrollable main content box.
* **Child Screens**:
  - `groups-list.html` (`/groups`)
  - `groups-detail.html` (`/groups/:id`)
  - `focus-study-room.html` (`/groups/room/:id`)
  - `goals-and-challenges.html` (`/challenges`)
  - `leaderboard.html` (`/rankings`)
  - `analytics-performance.html` (`/analytics`)
  - `profile-command-center.html` (`/profile`)
  - `notifications-panel-v2.html` (`/notifications`)
  - `search-palette.html` (`/search`)
* **Structural Outline**:
  ```
  ┌──────────┬───────────────────────────────┐
  │          │          Top Navbar           │
  │          ├───────────────────────────────┤
  │ Sidebar  │                               │
  │ (256px)  │                               │
  │          │      Scrollable Content       │
  │          │                               │
  └──────────┴───────────────────────────────┘
  ```

---

## 4. `DashboardLayout`
* **Description**: Extends `MainLayout` but overrides padding and dashboard cards. Custom topbar and stats highlights.
* **Child Screens**:
  - `dashboard-focus.html` (`/dashboard`)
* **Structural Outline**:
  ```
  ┌──────────┬───────────────────────────────┐
  │          │   Dashboard Stats Dials       │
  │          ├───────────────────────────────┤
  │ Sidebar  │                               │
  │ (256px)  │   Bento Grid Layout Widgets   │
  │          │                               │
  └──────────┴───────────────────────────────┘
  ```

---

## 5. `FocusLayout`
* **Description**: Fullscreen focus mode shell. Sidebar collapsed to narrow icon vertical tab strip (`80px`) or completely hidden (custom toggle state). Features a breathing timer background glow and custom top exit trigger.
* **Child Screens**:
  - `focus-mode-active.html` (`/focus`)
* **Structural Outline**:
  ```
  ┌────────┬─────────────────────────────────┐
  │        │          [ Exit Focus ]         │
  │Sidebar ├─────────────────────────────────┤
  │(80px   │                                 │
  │ or Off)│       Giant Timer Ring          │
  │        │                                 │
  └────────┴─────────────────────────────────┘
  ```
