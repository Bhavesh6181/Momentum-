CREATE TABLE group_analytics_snapshots (
    group_id UUID NOT NULL PRIMARY KEY,
    total_study_hours_this_week DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    most_active_member_id UUID,
    most_active_member_username VARCHAR(50),
    last_computed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_group_analytics_snapshots_group FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_group_analytics_snapshots_member FOREIGN KEY (most_active_member_id) REFERENCES users(id) ON DELETE SET NULL
);
