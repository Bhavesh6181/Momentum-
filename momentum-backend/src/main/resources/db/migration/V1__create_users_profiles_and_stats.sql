-- ============================================================================
-- INDEXING DECISIONS & JUSTIFICATIONS
-- ============================================================================
-- 1. PRIMARY & UNIQUE KEY INDEXES:
--    - users(username), users(email) are indexed automatically via UNIQUE constraints.
--      These indices ensure unique identity constraints and speed up lookup during
--      user login/registration.
--
-- 2. FOREIGN KEY INDEXES:
--    - user_profiles(user_id) has a UNIQUE index to support the 1:1 bidirectional
--      relationship lookup (profile by user ID) and enforce uniqueness constraints.
--    - user_stats(user_id) has a UNIQUE index for the same 1:1 lookup behavior.
--
-- 3. PARTIAL / CONDITIONAL INDEXES:
--    - We create partial indexes on users(username) and users(email) WHERE deleted_at IS NULL.
--      Since soft-deleted users are queried out by default, this index optimizes
--      lookups on active users while ignoring the deleted ones.
-- ============================================================================

CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE TABLE user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(100),
    college VARCHAR(150),
    branch VARCHAR(100),
    graduation_year INTEGER,
    profile_picture_url VARCHAR(255),
    skills JSONB,
    target_company VARCHAR(100),
    target_package VARCHAR(50),
    github_link VARCHAR(255),
    linkedin_link VARCHAR(255),
    bio TEXT,
    CONSTRAINT uq_user_profiles_user_id UNIQUE (user_id),
    CONSTRAINT fk_user_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE user_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    study_hours DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    total_tasks_completed INTEGER DEFAULT 0 NOT NULL,
    dsa_problems_solved INTEGER DEFAULT 0 NOT NULL,
    current_streak INTEGER DEFAULT 0 NOT NULL,
    longest_streak INTEGER DEFAULT 0 NOT NULL,
    weekly_hours DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    monthly_hours DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    CONSTRAINT uq_user_stats_user_id UNIQUE (user_id),
    CONSTRAINT fk_user_stats_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Partial indexes to optimize logins/lookups on active (non-soft-deleted) accounts
CREATE INDEX idx_users_username_active ON users (username) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email_active ON users (email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_deleted_at ON users (deleted_at);
