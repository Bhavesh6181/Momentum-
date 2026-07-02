-- ============================================================
-- V10: Activity feed for real-time event broadcasting
-- ============================================================

CREATE TABLE activities (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id    UUID         REFERENCES groups(id) ON DELETE SET NULL,
    type        VARCHAR(50)  NOT NULL,
    description TEXT,
    metadata    TEXT,        -- JSON stored as text (avoids JSONB H2 compat issues)
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activities_group_id   ON activities (group_id, created_at DESC);
CREATE INDEX idx_activities_user_id    ON activities (user_id);
CREATE INDEX idx_activities_created_at ON activities (created_at DESC);
