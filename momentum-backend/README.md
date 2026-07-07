# Momentum — Collaborative Study Platform

> A full-stack Spring Boot backend for a placement preparation study platform with real-time collaboration, goal tracking, leaderboards, and AI-ready analytics.

[![CI](https://github.com/Bhavesh6181/Momentum-/actions/workflows/gradle.yml/badge.svg)](https://github.com/Bhavesh6181/Momentum-/actions/workflows/gradle.yml)

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Modules](#modules)
- [Getting Started](#getting-started)
- [Running Locally](#running-locally)
- [Running with Docker Compose](#running-with-docker-compose)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Design Decisions](#design-decisions)
- [Testing](#testing)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          Client (React/SockJS)                           │
└────────────────────────────┬────────────────────────────────────┬────────┘
                             │ HTTP/REST                          │ STOMP/WS
                             ▼                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                        Spring Boot 3 Backend                             │
│                                                                          │
│  ┌───────────┐  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  REST     │  │ WebSocket  │  │  Schedulers  │  │  Event Listeners │  │
│  │ Controllers│  │  STOMP/WS  │  │  (Midnight)  │  │  (Domain Events) │  │
│  └─────┬─────┘  └─────┬──────┘  └──────┬───────┘  └────────┬─────────┘  │
│        │              │                 │                   │            │
│        └──────────────┴─────────────────┴──────────────┬───┘            │
│                                                         │                │
│                                                 Service Layer            │
│                                                         │                │
│              ┌──────────────┬──────────────────┬────────┘                │
│              ▼              ▼                  ▼                         │
│         PostgreSQL        Redis             RestTemplate                 │
│         (JPA/Hibernate)   (Presence/        (GitHub API)                 │
│                            Leaderboards/                                 │
│                            Cache)                                        │
└──────────────────────────────────────────────────────────────────────────┘
```

**Domain event flow:** `StudySessionService` → `StudySessionEndedEvent` → `StreakService` + `LeaderboardEventListener` + `ActivityEventListener` + `NotificationEventListener` (all via `@TransactionalEventListener(AFTER_COMMIT)`)

---

## Tech Stack

| Layer          | Technology                                         |
|----------------|----------------------------------------------------|
| Language        | Java 21                                            |
| Framework       | Spring Boot 3.x                                    |
| Database        | PostgreSQL 16 (JPA + Hibernate)                    |
| Cache / PubSub  | Redis 7 (presence, leaderboards, GitHub cache)     |
| Real-time       | Spring WebSocket + STOMP over SockJS               |
| Security        | Spring Security, JWT (access + refresh tokens)     |
| API Docs        | SpringDoc OpenAPI 3 (Swagger UI)                   |
| Scheduling      | Spring `@Scheduled` (streak job, presence cleanup) |
| Build           | Gradle 8 (Kotlin DSL)                              |
| Testing         | JUnit 5, MockMvc, H2 in-memory, Mockito            |
| Containerization| Docker (multi-stage), Docker Compose               |
| CI              | GitHub Actions                                     |

---

## Modules

### Auth
- `POST /api/v1/auth/register` — register new user
- `POST /api/v1/auth/login` — login, returns access + refresh JWT
- `POST /api/v1/auth/refresh` — obtain new access token from refresh token
- `POST /api/v1/auth/logout` — invalidate refresh token

### Groups
- `POST /api/v1/groups` — create group
- `POST /api/v1/groups/join/{inviteCode}` — join via invite code
- `GET /api/v1/groups/my` — list my groups
- `GET /api/v1/groups/{id}` — group detail
- `DELETE /api/v1/groups/{id}/leave` — leave group
- `POST /api/v1/groups/{id}/invite` — generate/view invite code (admin)

### Study Sessions
- `POST /api/v1/sessions/start` — start session (fails if already active)
- `POST /api/v1/sessions/{id}/end` — end session, computes durationMinutes
- `GET /api/v1/sessions/active` — current active session (204 if none)
- `GET /api/v1/sessions/history` — paginated history with filters

### Pomodoro
- `POST /api/v1/pomodoro/start` — start Pomodoro session (server-side timer)
- `POST /api/v1/pomodoro/{id}/complete-cycle` — increment cycle count
- `POST /api/v1/pomodoro/{id}/end` — end session
- `GET /api/v1/pomodoro/history` — history

> ⏱ **Timer Design:** `startedAt` is stored server-side. The client computes `elapsed = now - startedAt` on every page load, making the timer fully resumable after refresh.

### Goals & Challenges
- `POST /api/v1/goals` — create personal or group goal
- `PUT /api/v1/goals/{id}/progress` — update progress
- `GET /api/v1/goals/me` — list own goals (filter by type/status)
- `GET /api/v1/goals/group/{groupId}` — group goals
- `POST /api/v1/groups/{groupId}/challenges` — create challenge (admin only)
- `POST /api/v1/challenges/{id}/join` — join challenge
- `PUT /api/v1/challenges/{id}/progress` — update progress
- `GET /api/v1/challenges/{id}/leaderboard` — participants sorted by progress

### Real-time (WebSocket STOMP)
- Endpoint: `ws://localhost:8080/ws` (SockJS fallback)
- Heartbeat: `SEND /app/presence/update`
- Subscriptions:
  - `/topic/group/{groupId}/presence` — group member presence changes
  - `/topic/group/{groupId}/activity` — live activity feed
  - `/topic/user/{userId}/notifications` — personal notification push

### Notifications
- `GET /api/v1/notifications` — paginated, unread-first
- `PUT /api/v1/notifications/{id}/read` — mark one as read
- `PUT /api/v1/notifications/read-all` — mark all as read
- `GET /api/v1/notifications/unread-count` — badge count

### Analytics
- `GET /api/v1/analytics/me/weekly-hours` — Chart.js-ready weekly study hours
- `GET /api/v1/analytics/me/monthly-progress` — monthly progress chart
- `GET /api/v1/analytics/me/category-distribution` — subject pie-chart data
- `GET /api/v1/analytics/groups/{groupId}/most-active` — most active member chart
- `GET /api/v1/analytics/groups/{groupId}/productive-hours` — hourly histogram

### Search
- `GET /api/v1/search?q={query}&type={all|groups|users|activities|challenges}` — unified ILIKE search with group privacy enforcement

### GitHub Integration
- `POST /api/v1/github/sync/{userId}` — sync public GitHub activity (Redis-cached for 1h, SHA-tracked for new commit detection)
- `GET /api/v1/github/{userId}/activity` — get cached activity

### Leaderboards
- `GET /api/v1/groups/{groupId}/leaderboard?type=STUDY_HOURS&range=WEEKLY` — Redis sorted-set backed ranking (O(log N) per update, O(N) to read)

---

## Getting Started

### Prerequisites

- **Java 21+** — [Download](https://adoptium.net/)
- **Docker & Docker Compose** — [Install](https://docs.docker.com/get-docker/)
- *(Optional)* **IntelliJ IDEA** with Spring Boot plugin

### Clone

```bash
git clone https://github.com/Bhavesh6181/Momentum-.git
cd Momentum-/momentum-backend
```

---

## Running Locally

1. **Start infrastructure** (Postgres + Redis only):
   ```bash
   docker-compose up postgres redis -d
   ```

2. **Set environment variables** (or use `application.yml`):
   ```bash
   # Copy the sample env
   cp .env.example .env
   # Edit .env with your JWT secret
   ```

3. **Run the application**:
   ```bash
   ./gradlew bootRun
   ```

4. **Access Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

## Running with Docker Compose

Start the full stack (backend + postgres + redis + adminer):

```bash
docker-compose up --build
```

| Service  | URL                              |
|----------|----------------------------------|
| Backend  | http://localhost:8080            |
| Swagger  | http://localhost:8080/swagger-ui.html |
| Adminer  | http://localhost:8081            |
| Redis    | localhost:6379                   |

Stop the stack:
```bash
docker-compose down
```

---

## API Documentation

Full interactive API documentation is available at **http://localhost:8080/swagger-ui.html** when the application is running.

To authenticate in Swagger UI:
1. Call `POST /api/v1/auth/login`
2. Copy the `accessToken` from the response
3. Click **Authorize** → paste `Bearer <token>`

---

## Environment Variables

| Variable                         | Default                          | Description                            |
|----------------------------------|----------------------------------|----------------------------------------|
| `SPRING_DATASOURCE_URL`          | `jdbc:postgresql://localhost:5432/momentum` | PostgreSQL JDBC URL           |
| `SPRING_DATASOURCE_USERNAME`     | `postgres`                       | DB username                            |
| `SPRING_DATASOURCE_PASSWORD`     | `postgres`                       | DB password                            |
| `SPRING_DATA_REDIS_HOST`         | `localhost`                      | Redis host                             |
| `SPRING_DATA_REDIS_PORT`         | `6379`                           | Redis port                             |
| `APP_JWT_SECRET`                 | *(required)*                     | ≥256-bit HMAC-SHA key                  |
| `APP_JWT_EXPIRATION_MS`          | `86400000` (1 day)               | Access token TTL                       |
| `APP_JWT_REFRESH_EXPIRATION_MS`  | `604800000` (7 days)             | Refresh token TTL                      |
| `APP_STREAK_MINIMUM_STUDY_MINUTES` | `30`                           | Min minutes/day to count as active day |

---

## Design Decisions

### ⏱ Server-side Timer
The Pomodoro/study timer `startedAt` is persisted in the database. On every page load, the client computes `elapsed = Date.now() - startedAt`. This means the countdown is **fully resumable after refresh or reconnect** — no client-side countdown state is persisted.

### 🔥 Redis Sorted Sets for Leaderboards
Leaderboard scores are updated via `ZINCRBY` in O(log N) time on every session-end / task-complete event. Rankings are served in O(N log N) from Redis — no SQL query per request. User names are hydrated with a single batched SQL query (`WHERE id IN (...)`) after fetching the sorted set.

### 📡 Event-driven Side Effects
All side effects (streak updates, leaderboard updates, activity feed entries, notification creation) are decoupled from the primary service layer via Spring's `ApplicationEventPublisher` and `@TransactionalEventListener(phase = AFTER_COMMIT)`. This ensures events only fire after the DB transaction commits.

### 🔒 WebSocket Security
STOMP subscriptions are validated by a `TopicSubscriptionInterceptor` (`ChannelInterceptor`) that parses the JWT from the `CONNECT` frame. Users can only subscribe to:
- Their own `/topic/user/{userId}/notifications`
- Groups they are members of

### 🔴 Presence Debounce
On WebSocket disconnect, users are not immediately marked OFFLINE. A Redis TTL-based approach marks them `AWAY` after a 30-second grace period. A scheduler checks for users whose `lastActiveAt` exceeds the TTL and transitions them to `OFFLINE` — preventing premature offline transitions on tab switches.

### 🔔 Notification Abstraction
`NotificationService` is defined as an interface. The current implementation is synchronous and in-process. A RabbitMQ/SQS-backed implementation can be swapped in without touching any callers, as documented in code comments.

---

## Testing

```bash
# Run all tests
./gradlew test

# Run with test report
./gradlew test jacocoTestReport
open build/reports/jacoco/test/html/index.html
```

### Test coverage includes:
- **AuthIntegrationTest** — register, login, JWT validation, refresh token
- **StudySessionIntegrationTest** — start/end/active/history, duplicate session guard
- **PomodoroIntegrationTest** — full cycle workflow
- **GoalChallengeH2Test** — goal CRUD, progress update, challenge join/leaderboard
- **NotificationIntegrationTest** — goal completion → notification, unread-count, mark-read
- **AnalyticsIntegrationTest** — chart endpoint structure and empty-state handling
- **SearchIntegrationTest** — ILIKE partial matching, private group privacy enforcement
- **GithubSyncIntegrationTest** — mocked sync response, cached activity retrieval

All integration tests use **H2 in-memory database** with `MODE=PostgreSQL` and mock out Redis via `@MockBean`. No external services required to run tests.
