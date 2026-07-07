ALTER TABLE groups ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL;
ALTER TABLE group_members ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL;

-- Migrate existing PENDING roles to role=MEMBER + status=PENDING
UPDATE group_members SET status = 'PENDING', role = 'MEMBER' WHERE role = 'PENDING';

CREATE INDEX idx_group_analytics_snapshots_last_computed_at ON group_analytics_snapshots (last_computed_at);
