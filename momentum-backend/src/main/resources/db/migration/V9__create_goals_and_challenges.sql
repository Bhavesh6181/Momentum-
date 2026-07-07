-- ============================================================
-- V9: Goals, Challenges, and ChallengeParticipants
-- ============================================================

CREATE TABLE goals (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id      UUID         REFERENCES groups(id) ON DELETE SET NULL,
    type          VARCHAR(20)  NOT NULL,   -- DAILY | WEEKLY | MONTHLY
    title         VARCHAR(200) NOT NULL,
    target_value  DOUBLE PRECISION NOT NULL,
    current_value DOUBLE PRECISION NOT NULL DEFAULT 0,
    unit          VARCHAR(50)  NOT NULL,   -- e.g. "problems", "hours"
    status        VARCHAR(20)  NOT NULL DEFAULT 'IN_PROGRESS',
    start_date    DATE         NOT NULL,
    end_date      DATE         NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_goals_user_id         ON goals (user_id);
CREATE INDEX idx_goals_group_id        ON goals (group_id);
CREATE INDEX idx_goals_status_end_date ON goals (status, end_date);
CREATE INDEX idx_goals_type            ON goals (type);

-- ============================================================

CREATE TABLE challenges (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id      UUID         NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    created_by    UUID         NOT NULL REFERENCES users(id),
    title         VARCHAR(200) NOT NULL,
    description   TEXT,
    target_value  DOUBLE PRECISION NOT NULL,
    unit          VARCHAR(50)  NOT NULL,
    start_date    DATE         NOT NULL,
    end_date      DATE         NOT NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'OPEN',   -- OPEN | CLOSED
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_challenges_group_id        ON challenges (group_id);
CREATE INDEX idx_challenges_status_end_date ON challenges (status, end_date);

-- ============================================================

CREATE TABLE challenge_participants (
    challenge_id      UUID             NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id           UUID             NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
    current_progress  DOUBLE PRECISION NOT NULL DEFAULT 0,
    joined_at         TIMESTAMPTZ      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (challenge_id, user_id)
);

CREATE INDEX idx_challenge_participants_user_id      ON challenge_participants (user_id);
CREATE INDEX idx_challenge_participants_challenge_id ON challenge_participants (challenge_id);
