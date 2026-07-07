# Momentum Frontend Component Hierarchy

This document maps the nested component hierarchies for each primary screen layout.

---

## 1. Dashboard (`dashboard-focus.html` / `/dashboard`)
```
Dashboard
 ├── Sidebar (Layout)
 ├── Navbar (Layout)
 ├── WelcomeBanner
 └── MainGrid (Layout Grid)
      ├── FocusTimerWidget (Large Card)
      │    ├── StatusIndicator
      │    └── PrimaryButton ("Resume/Pause")
      ├── GlobalStatsPanel (Sidebar Card)
      │    ├── StatsDial (Total Hours)
      │    └── Badge (Streak / Rank)
      └── MilestoneProgressCard
           └── ProgressBar (Interactive)
```

---

## 2. Active Focus Mode (`focus-mode-active.html` / `/focus`)
```
ActiveFocusMode
 ├── Sidebar (Layout - Collapsed to 80px)
 ├── GrainOverlay (CSS shader overlay)
 ├── TimerSection
 │    ├── CategoryLabel ("Quantum Physics II")
 │    ├── TimerRing (Circular SVG countdown)
 │    │    └── TimerText ("24:59")
 │    └── ControlsRow
 │         ├── IconButton (Pause)
 │         ├── Toggle (Studying/Break status selector)
 │         └── GhostButton (End Session)
 └── FriendsPresenceDrawer (Collapsible drawer)
      ├── DrawerHeader ("Friends studying now")
      └── AvatarGroup (Horizontal stack of online peers)
```

---

## 3. Study Rooms & Collaboration (`focus-study-room.html` / `/groups/room/:id`)
```
StudyRoom
 ├── Sidebar (Layout)
 ├── Navbar (Layout)
 └── RoomGrid
      ├── SharedFocusCanvas (8-columns, Card)
      │    ├── SharedTimerText ("42:18")
      │    ├── SegmentedProgressDotRow
      │    └── ActionsRow
      │         ├── SecondaryButton ("Take Break")
      │         └── PrimaryButton ("Pause Session")
      ├── SessionStreakPanel (4-columns, Card)
      │    ├── SectionHeader ("Session Streak")
      │    └── StreakList
      │         └── RankRow (Candidate name, timer score in minutes)
      └── ParticipantPresenceGrid (Bottom footer panel)
           ├── PresenceAvatarGroup
           └── ActiveGoalDescription
```

---

## 4. Groups Board (`groups-list.html` / `/groups`)
```
GroupsBoard
 ├── Sidebar (Layout)
 ├── Navbar (Layout)
 ├── BoardHeader
 │    ├── SearchInput
 │    └── PrimaryButton ("New Group")
 ├── GroupsModal (Conditional Modal overlay)
 │    ├── ModalHeader
 │    ├── InputField (Title, Category)
 │    └── ButtonGroup (Submit / Cancel)
 └── GroupsCardsGrid
      └── GroupCard (Active room details, tags, participant counters)
```

---

## 5. Group Detail (`groups-detail.html` / `/groups/:id`)
```
GroupDetail
 ├── Sidebar (Layout)
 ├── Navbar (Layout)
 ├── GroupHeader
 │    └── PrimaryButton ("Join Room" / "Join Study Session")
 ├── DetailGrid
 │    ├── GoalSettingCard
 │    │    ├── GoalsList
 │    │    └── CreateGoalInput
 │    ├── MemberPresenceCard
 │    │    └── MemberList (Candidate avatars, role designations)
 │    └── InviteDialog (Modal popup)
 └── GroupSettingsForm (Admin view only)
```

---

## 6. Goals & Challenges (`goals-and-challenges.html` / `/challenges`)
```
GoalsAndChallenges
 ├── Sidebar (Layout)
 ├── Navbar (Layout)
 ├── SprintsHeader
 └── ColumnsLayout (Asymmetric Grid)
      ├── PersonalGoalsCard
      │    ├── GoalProgressBar
      │    └── CreateGoalInput
      └── CommunityChallengesCard
           └── ChallengesList
                └── ChallengeItem (Streak badges, sync status)
```

---

## 7. Leaderboard (`leaderboard.html` / `/rankings`)
```
Leaderboard
 ├── Sidebar (Layout)
 ├── Navbar (Layout)
 ├── LeaderboardHeader
 │    ├── SegmentedControl (This Group / Global)
 │    └── SegmentedControl (Study Hours / Streak / Tasks / Consistency)
 ├── LeaderboardTable
 │    ├── TableHeader
 │    └── TableBody
 │         └── RankRow (Position, avatar, candidate name, score indicator)
 └── StickyUserRow (Bottom footer overlay)
      └── RankRow (Alex Rivera / Current user spotlight)
```

---

## 8. Analytics Command (`analytics-performance.html` / `/analytics`)
```
AnalyticsCommand
 ├── Sidebar (Layout)
 ├── Navbar (Layout)
 ├── ControlsHeader
 │    ├── CalendarSelector
 │    └── SecondaryButton ("Export Report")
 ├── QuickStatsGrid (4stat tiles)
 │    └── StatsCard (Current count, mini sparkline/histogram chart)
 └── ChartsSection
      ├── IntensityChartCard (Line chart SVG path, custom gradient fill)
      └── CategoriesBreakdownCard
           └── CategoryProgressBarList
```

---

## 9. Onboarding Flows (`/onboarding/*`)
```
OnboardingFlow
 ├── OnboardingLayout (Wizard step header)
 └── OnboardingStepCard
      ├── ProgressIndicator
      ├── CollegeSelection (Step 1)
      │    └── SelectionList (Search, radio items)
      ├── CareerGoals (Step 2)
      │    └── MultiSelectionGrid (Tags selector)
      ├── AcademicInfo (Step 3)
      │    └── DropdownSelector (Major, Year inputs)
      ├── SocialSync (Step 4)
      │    └── GithubSyncButton (Contribution sync triggers)
      └── AvatarUpload (Step 5)
           └── UploadZone (Drag & drop image upload area)
```
