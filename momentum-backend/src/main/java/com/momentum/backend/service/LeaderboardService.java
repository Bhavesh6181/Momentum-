package com.momentum.backend.service;

import com.momentum.backend.dto.response.LeaderboardEntryResponse;

import java.util.List;
import java.util.UUID;

public interface LeaderboardService {

    /**
     * Updates the score for a user in the leaderboards (all-time, weekly, and monthly).
     *
     * @param userId    the ID of the user
     * @param groupId   the ID of the group (nullable)
     * @param type      the leaderboard type (studyHours, tasksCompleted, streak)
     * @param increment the amount to increment (or set, in the case of streak)
     */
    void updateScore(UUID userId, UUID groupId, String type, double increment);

    /**
     * Retrieves top ranking entries for a group (or "global").
     *
     * @param groupIdStr the string representing group ID or "global"
     * @param type       the leaderboard type (studyHours, streak, tasksCompleted)
     * @param range      the leaderboard range (weekly, monthly, all-time)
     * @param limit      maximum number of entries to return
     * @return the list of leaderboard entry DTOs
     */
    List<LeaderboardEntryResponse> getLeaderboard(String groupIdStr, String type, String range, int limit);
}
