CREATE TABLE pomodoro_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    mode VARCHAR(20) NOT NULL,
    work_minutes INTEGER NOT NULL,
    break_minutes INTEGER NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    cycles_completed INTEGER DEFAULT 0 NOT NULL,
    CONSTRAINT fk_pomodoro_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_pomodoro_sessions_user_id ON pomodoro_sessions (user_id);
CREATE INDEX idx_pomodoro_sessions_started_at ON pomodoro_sessions (started_at);
