package com.momentum.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(
    name = "user_stats",
    indexes = {
        @Index(name = "uq_user_stats_user_id", columnList = "user_id", unique = true)
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "user")
@EqualsAndHashCode(exclude = "user")
public class UserStats {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "study_hours", nullable = false)
    @Builder.Default
    private double studyHours = 0.0;

    @Column(name = "total_tasks_completed", nullable = false)
    @Builder.Default
    private int totalTasksCompleted = 0;

    @Column(name = "dsa_problems_solved", nullable = false)
    @Builder.Default
    private int dsaProblemsSolved = 0;

    @Column(name = "current_streak", nullable = false)
    @Builder.Default
    private int currentStreak = 0;

    @Column(name = "longest_streak", nullable = false)
    @Builder.Default
    private int longestStreak = 0;

    @Column(name = "weekly_hours", nullable = false)
    @Builder.Default
    private double weeklyHours = 0.0;

    @Column(name = "monthly_hours", nullable = false)
    @Builder.Default
    private double monthlyHours = 0.0;
}
