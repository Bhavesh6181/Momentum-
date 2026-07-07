package com.momentum.backend.service;

import java.util.UUID;

public interface StreakService {

    /**
     * Records study duration for a user for the current date.
     *
     * @param userId          the ID of the user
     * @param durationMinutes study duration in minutes
     */
    void recordDailyStudyMinutes(UUID userId, int durationMinutes);

    /**
     * Records goal completion for a user for the current date.
     *
     * @param userId the ID of the user
     */
    void recordDailyGoalCompleted(UUID userId);

    /**
     * Performs the nightly streak calculation for all active users.
     * Checks yesterday's activity against the threshold and increments or resets streaks.
     */
    void evaluateNightlyStreaks();
}
