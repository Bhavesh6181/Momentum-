# Momentum React Component Manifest

This manifest documents the React component inventory to be built for the **Momentum** frontend. Components are grouped by functional layers to ensure separation of concerns and maximum reusability.

---

## Directory Overview

```
components/
├── ui/                 # Atomic, style-pure components (inputs, indicators, buttons)
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Textarea.tsx
│   ├── Select.tsx
│   ├── Checkbox.tsx
│   ├── Toggle.tsx
│   ├── Badge.tsx
│   ├── Avatar.tsx
│   ├── Tooltip.tsx
│   ├── Toast.tsx
│   └── ProgressBar.tsx
│
├── layout/             # Structural shell components
│   ├── Sidebar.tsx
│   ├── Navbar.tsx
│   └── PageLayout.tsx
│
├── dashboard/          # Widget and layout components for overview pages
│   ├── StatsCard.tsx
│   ├── FocusVelocityChart.tsx
│   └── ActivityFeed.tsx
│
├── leaderboard/        # Peer rankings and lists
│   ├── LeaderboardCard.tsx
│   └── RankRow.tsx
│
├── focus/              # Specialized focus utility elements
│   ├── TimerRing.tsx
│   ├── FocusControls.tsx
│   └── FriendPresenceList.tsx
│
└── groups/             # Collaboration and onboarding widgets
    ├── GroupCard.tsx
    ├── MemberList.tsx
    └── OnboardingStep.tsx
```

---

## Component Specifications

### 1. UI Elements (`components/ui/`)

#### `Button`
* **Props**: 
  - `variant`: `'primary' | 'secondary' | 'ghost' | 'danger'`
  - `disabled`: `boolean`
  - `onClick`: `() => void`
  - `className`: `string`
* **Tailwind Classes**: Standardizes button dimensions, transition triggers, and state animations.

#### `Input`
* **Props**:
  - `value`: `string`
  - `onChange`: `(val: string) => void`
  - `placeholder`: `string`
  - `type`: `'text' | 'password' | 'email'`
  - `disabled`: `boolean`

#### `Textarea`
* **Props**: Same as `Input` with additional `rows: number`.

#### `Select`
* **Props**:
  - `options`: `Array<{ value: string; label: string }>`
  - `value`: `string`
  - `onChange`: `(val: string) => void`

#### `Checkbox`
* **Props**:
  - `checked`: `boolean`
  - `onChange`: `(val: boolean) => void`
  - `label`: `string`

#### `Toggle`
* **Props**:
  - `checked`: `boolean`
  - `onChange`: `(val: boolean) => void`
  - `labels`: `[string, string]` (e.g., `["Studying", "Break"]`)

#### `Badge`
* **Props**:
  - `variant`: `'streak' | 'level' | 'default'`
  - `children`: `React.ReactNode`

#### `Avatar`
* **Props**:
  - `src`: `string`
  - `alt`: `string`
  - `size`: `'sm' | 'md' | 'lg'`
  - `isCurrentUser`: `boolean` (adds indigo border accent)

#### `Tooltip`
* **Props**:
  - `content`: `string`
  - `children`: `React.ReactNode`

#### `Toast`
* **Props**:
  - `message`: `string`
  - `type`: `'info' | 'success' | 'error'`
  - `onClose`: `() => void`

#### `ProgressBar`
* **Props**:
  - `progress`: `number` (0 to 100)
  - `color`: `'indigo' | 'green'`

---

### 2. Layout Elements (`components/layout/`)

#### `Sidebar`
* **Props**: 
  - `activeTab`: `'home' | 'focus' | 'groups' | 'leaderboard' | 'analytics'`
  - `onTabChange`: `(tab: string) => void`
* **Child Modules**: Side navigation links, logo block, start focus button, support links, profile log-out block.

#### `Navbar`
* **Props**:
  - `title`: `string` (Current screen name context)
  - `user`: `{ name: string; avatarUrl: string }`
* **Child Modules**: Notifications panel button, settings button, search input field.

#### `PageLayout`
* **Props**:
  - `title`: `string`
  - `children`: `React.ReactNode`
* **Description**: Wraps sidebar nav and header with responsive padding to ensure correct canvas background alignment.

---

### 3. Dashboard Elements (`components/dashboard/`)

#### `StatsCard`
* **Props**:
  - `label`: `string`
  - `value`: `string | number`
  - `trend`: `number` (optional, e.g., `+12%`)
  - `chartData`: `number[]` (translucent sparkline data)

#### `FocusVelocityChart`
* **Props**:
  - `dataPoints`: `number[]` (coordinates for focus velocity path)
  - `labels`: `string[]` (temporal axis labels)

#### `ActivityFeed`
* **Props**:
  - `feedItems`: `Array<{ id: string; user: string; action: string; time: string }>`

---

### 4. Leaderboard Elements (`components/leaderboard/`)

#### `LeaderboardCard`
* **Props**:
  - `candidates`: `Array<{ rank: number; name: string; college: string; score: number; avatar: string }>`
* **Description**: Container wrapping the ranking list with table headings.

#### `RankRow`
* **Props**:
  - `rank`: `number`
  - `name`: `string`
  - `college`: `string`
  - `score`: `number`
  - `avatar`: `string`
  - `isCurrentUser`: `boolean` (adds custom highlight backgrounds)

---

### 5. Focus Mode Elements (`components/focus/`)

#### `TimerRing`
* **Props**:
  - `timeRemaining`: `number` (seconds)
  - `totalTime`: `number` (seconds)
  - `status`: `'active' | 'paused' | 'break'`

#### `FocusControls`
* **Props**:
  - `isActive`: `boolean`
  - `onToggle`: `() => void`
  - `onReset`: `() => void`
  - `onEnd`: `() => void`

#### `FriendPresenceList`
* **Props**:
  - `friends`: `Array<{ id: string; name: string; avatar: string; focusTime: string; isOnline: boolean }>`

---

### 6. Study Group Elements (`components/groups/`)

#### `GroupCard`
* **Props**:
  - `title`: `string`
  - `description`: `string`
  - `activeCount`: `number`
  - `tags`: `string[]`
  - `onClick`: `() => void`

#### `MemberList`
* **Props**:
  - `members`: `Array<{ id: string; name: string; role: string; avatar: string }>`

#### `OnboardingStep`
* **Props**:
  - `stepIndex`: `number`
  - `title`: `string`
  - `description`: `string`
  - `children`: `React.ReactNode`
