# Momentum Frontend API Mapping

This document specifies the REST API endpoints, WebSocket channels, loading feedback configurations, empty states, and error handlers for each primary application page.

---

## 1. Authentication (`/signup`, `/signin`)
* **REST Endpoints**:
  - `POST /api/v1/auth/register` (Registers email and password)
  - `POST /api/v1/auth/login` (Returns access & refresh tokens)
* **Loading States**: Disable primary button and show a spinner indicator.
* **Empty States**: Validation placeholders for username/password fields.
* **Error States**: Display error messages (e.g. "Email already registered" or "Invalid credentials") inside an absolute-positioned top banner.

---

## 2. Onboarding (`/onboarding/*`)
* **REST Endpoints**:
  - `GET /api/v1/users/me` (Retrieve current incomplete profile status)
  - `PATCH /api/v1/users/me` (Update college, objectives, branch details)
  - `POST /api/v1/github/sync/{userId}` (First-time Github contributions fetch)
  - `POST /api/v1/users/me/profile-picture` (Upload multipart avatar file)
* **Loading States**: Shimmer overlays inside profile picture container. Spinner inside GitHub sync button during the remote API fetch.
* **Empty States**: Fallback defaults if Github sync has no commits (Contributions: 0).
* **Error States**: Toast alerts for invalid image uploads or connection timeouts during GitHub sync.

---

## 3. Dashboard (`/dashboard`)
* **REST Endpoints**:
  - `GET /api/v1/users/me/stats` (Fetch streak counts and total focus hours)
  - `GET /api/v1/sessions/active` (Checks for any active running study session)
  - `GET /api/v1/groups` (List user's joined study groups)
* **Loading States**: Skeleton card placeholders for bento dashboard cards and group slots.
* **Empty States**: "No joined groups" message with secondary link to browse the discoverable groups board.
* **Error States**: Absolute toast alerts if user profile data fails to load.

---

## 4. Active Focus Mode (`/focus`)
* **REST Endpoints**:
  - `POST /api/v1/sessions/start` (Starts focus timer count)
  - `POST /api/v1/sessions/{sessionId}/end` (Ends focus timer count)
  - `POST /api/v1/pomodoro/start` (Starts Pomodoro session cycle)
* **WebSocket Subscriptions**:
  - `/app/presence/update` (Send presence state payload)
* **Loading States**: Translucent backdrop overlay during transition states.
* **Empty States**: *N/A (Focus timer defaults to 25:00)*
* **Error States**: Alert banner if the active session fails to save to the database (allows manual offline recovery options).

---

## 5. Collaborative Study Room (`/groups/room/:id`)
* **REST Endpoints**:
  - `GET /api/v1/groups/{groupId}` (Get room details, schedules, and active goal)
  - `GET /api/v1/groups/{groupId}/online-members` (Fetch list of online room candidates)
  - `GET /api/v1/groups/{groupId}/activity` (Get scrolling feed of student event logs)
* **WebSocket Subscriptions**:
  - `/topic/groups/{groupId}/online` (Subscribes to live presence lists updates)
  - `/topic/groups/{groupId}/activity` (Subscribes to new action feeds)
* **Loading States**: Skeletons for the session streak ranking table.
* **Empty States**: "Empty study room. Join to start focus session."
* **Error States**: Inline alert if WebSocket connection disconnects (attempts automatic reconnect triggers).

---

## 6. Groups Board (`/groups`)
* **REST Endpoints**:
  - `GET /api/v1/groups` (Fetch joined and discoverable lists)
  - `POST /api/v1/groups` (Create new group)
* **Loading States**: Grid skeleton loading cards.
* **Empty States**: "No groups found. Create a new group to invite peers."
* **Error States**: Alert overlays inside the group creation modal if fields are missing.

---

## 7. Group Detail (`/groups/:id`)
* **REST Endpoints**:
  - `GET /api/v1/groups/{groupId}` (Fetch details, schedules, and active targets)
  - `POST /api/v1/groups/{groupId}/join` (Request group membership)
  - `GET /api/v1/goals/group/{groupId}` (Get group collaborative goals)
* **Loading States**: Shimmer list layout for group member profiles.
* **Empty States**: "No collaborative goals set for this group."
* **Error States**: Validation errors if the member fails to join or settings edit requests are rejected.

---

## 8. Goals & Challenges (`/challenges`)
* **REST Endpoints**:
  - `GET /api/v1/goals/me` (Fetch user's personal objectives list)
  - `POST /api/v1/goals` (Set a new goal target)
  - `PUT /api/v1/goals/{id}/progress` (Increment goal count)
  - `GET /api/v1/groups/{groupId}/challenges` (List active sprints)
* **Loading States**: Shimmer bars replacing the linear progress tracks.
* **Empty States**: "No active goals set. Start a new goal to track productivity."
* **Error States**: Warning indicators if progress updates fail.

---

## 9. Leaderboard (`/rankings`)
* **REST Endpoints**:
  - `GET /api/v1/groups/{groupId}/leaderboard` (Retrieve ranked peers list)
  - `GET /api/v1/users/me/stats` (Compare current user's profile statistics)
* **Loading States**: Skeleton table list rows.
* **Empty States**: "No user rankings logged for this period."
* **Error States**: Error alert header above the table layout.

---

## 10. Performance Analytics (`/analytics`)
* **REST Endpoints**:
  - `GET /api/v1/analytics/me/weekly-hours` (Retrieve SVG bar chart data points)
  - `GET /api/v1/analytics/me/category-distribution` (Retrieve category progress distribution data)
  - `GET /api/v1/analytics/me/monthly-progress` (Retrieve line chart coordinates)
* **Loading States**: Skeleton line grids and loader widgets for the main SVG chart container.
* **Empty States**: "No data logs found. Complete a focus session to see insights."
* **Error States**: Fails to load alert, displaying static default chart placeholders.

---

## 11. Profile Command Center (`/profile`)
* **REST Endpoints**:
  - `GET /api/v1/users/me` (Retrieve current user profile data details)
  - `GET /api/v1/users/me/stats` (Streak and milestones stats)
  - `GET /api/v1/github/{userId}/activity` (Get contribution charts details)
* **Loading States**: Profile block skeletons, contributions block shimmer.
* **Empty States**: "No GitHub profile linked. Link your GitHub account to sync commits."
* **Error States**: Toast warnings if contribution fetch triggers fail.

---

## 12. Notifications Center (`/notifications`)
* **REST Endpoints**:
  - `GET /api/v1/notifications` (List notifications history)
  - `PUT /api/v1/notifications/{id}/read` (Mark specific alert read)
  - `PUT /api/v1/notifications/read-all` (Clear all unread alerts)
  - `GET /api/v1/notifications/unread-count` (Get count badge value)
* **WebSocket Subscriptions**:
  - `/topic/notifications/{userId}` (Live notifications incoming channel)
* **Loading States**: Loading indicators.
* **Empty States**: "All caught up! No unread notifications."
* **Error States**: Offline banner warning if the connection drops.
