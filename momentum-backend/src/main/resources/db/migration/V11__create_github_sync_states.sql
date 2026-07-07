CREATE TABLE github_sync_states (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    repo_name VARCHAR(255) NOT NULL,
    last_commit_sha VARCHAR(255) NOT NULL,
    last_synced_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT idx_git_sync_user_repo UNIQUE (user_id, repo_name)
);

CREATE INDEX idx_git_sync_user_id ON github_sync_states(user_id);
