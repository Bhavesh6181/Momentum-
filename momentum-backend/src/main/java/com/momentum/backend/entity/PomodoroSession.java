package com.momentum.backend.entity;

import com.momentum.backend.enums.PomodoroMode;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "pomodoro_sessions",
    indexes = {
        @Index(name = "idx_pomodoro_sessions_user_id", columnList = "user_id"),
        @Index(name = "idx_pomodoro_sessions_started_at", columnList = "started_at")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PomodoroSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PomodoroMode mode;

    @Column(name = "work_minutes", nullable = false)
    private int workMinutes;

    @Column(name = "break_minutes", nullable = false)
    private int breakMinutes;

    @Column(name = "started_at", nullable = false)
    @Builder.Default
    private OffsetDateTime startedAt = OffsetDateTime.now();

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "cycles_completed", nullable = false)
    @Builder.Default
    private int cyclesCompleted = 0;
}
