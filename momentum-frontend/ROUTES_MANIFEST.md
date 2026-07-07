# Momentum Frontend React Routes Manifest

This manifest documents every application route, its corresponding layout, authentication requirements, sidebar state, and the backend Java controller endpoints consumed.

---

## Route Mappings

| Route URL | Screen Mockup | Layout Wrap | Auth Required | Sidebar Visible | Backend Controller API Endpoints |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `/` | `marketing-landing-page.html` | None | No | No | *None (Static content)* |
| `/signup` | `auth-create-account.html` | `AuthLayout` | No | No | `POST /api/v1/auth/register` |
| `/signin` | `auth-sign-in.html` | `AuthLayout` | No | No | `POST /api/v1/auth/login` |
| `/forgot-password` | *N/A (Included in Sign In)* | `AuthLayout` | No | No | `POST /api/v1/auth/forgot-password` |
| `/reset-password` | *N/A (Email link)* | `AuthLayout` | No | No | `POST /api/v1/auth/reset-password` |
| `/onboarding/college`| `onboarding-college-selection.html`| `OnboardingLayout`| Yes | No | `GET /api/v1/users/me`<br>`PATCH /api/v1/users/me` (update college) |
| `/onboarding/goals` | `onboarding-career-goals.html` | `OnboardingLayout`| Yes | No | `PATCH /api/v1/users/me` (update goals) |
| `/onboarding/academic`| `onboarding-branch-and-year.html` | `OnboardingLayout`| Yes | No | `PATCH /api/v1/users/me` (update academic details) |
| `/onboarding/social` | `onboarding-social-links.html` | `OnboardingLayout`| Yes | No | `PATCH /api/v1/users/me` (update social profiles)<br>`POST /api/v1/github/sync/{userId}` |
| `/onboarding/avatar` | `onboarding-profile-picture.html` | `OnboardingLayout`| Yes | No | `POST /api/v1/users/me/profile-picture` |
| `/dashboard` | `dashboard-focus.html` | `MainLayout` | Yes | Yes (Expanded) | `GET /api/v1/users/me/stats`<br>`GET /api/v1/sessions/active`<br>`GET /api/v1/groups` |
| `/focus` | `focus-mode-active.html` | `FocusLayout` | Yes | Yes (Collapsed) | `POST /api/v1/sessions/start`<br>`POST /api/v1/sessions/{sessionId}/end`<br>`POST /api/v1/pomodoro/start` |
| `/groups` | `groups-list.html` | `MainLayout` | Yes | Yes (Expanded) | `GET /api/v1/groups`<br>`POST /api/v1/groups` (new group modal) |
| `/groups/:id` | `groups-detail.html` | `MainLayout` | Yes | Yes (Expanded) | `GET /api/v1/groups/{groupId}`<br>`POST /api/v1/groups/{groupId}/join`<br>`GET /api/v1/goals/group/{groupId}` |
| `/groups/room/:id` | `focus-study-room.html` | `MainLayout` | Yes | Yes (Expanded) | `GET /api/v1/groups/{groupId}`<br>`GET /api/v1/groups/{groupId}/online-members`<br>`GET /api/v1/groups/{groupId}/activity` |
| `/challenges` | `goals-and-challenges.html` | `MainLayout` | Yes | Yes (Expanded) | `GET /api/v1/goals/me`<br>`POST /api/v1/goals`<br>`PUT /api/v1/goals/{id}/progress`<br>`GET /api/v1/groups/{groupId}/challenges` |
| `/rankings` | `leaderboard.html` | `MainLayout` | Yes | Yes (Expanded) | `GET /api/v1/groups/{groupId}/leaderboard`<br>`GET /api/v1/users/me/stats` |
| `/analytics` | `analytics-performance.html` | `MainLayout` | Yes | Yes (Expanded) | `GET /api/v1/analytics/me/weekly-hours`<br>`GET /api/v1/analytics/me/category-distribution`<br>`GET /api/v1/analytics/me/monthly-progress` |
| `/profile` | `profile-command-center.html` | `MainLayout` | Yes | Yes (Expanded) | `GET /api/v1/users/me`<br>`GET /api/v1/users/me/stats`<br>`GET /api/v1/github/{userId}/activity` |
| `/notifications` | `notifications-panel-v2.html` | `MainLayout` | Yes | Yes (Expanded) | `GET /api/v1/notifications`<br>`PUT /api/v1/notifications/read-all`<br>`GET /api/v1/notifications/unread-count` |
| `/search` | `search-palette.html` | `MainLayout` | Yes | Yes (Expanded) | `GET /api/v1/search` |
