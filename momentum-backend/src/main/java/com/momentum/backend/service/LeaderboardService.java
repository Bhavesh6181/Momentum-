package com.momentum.backend.service;

import com.momentum.backend.dto.response.LeaderboardEntryResponse;
import com.momentum.backend.enums.LeaderboardRange;
import com.momentum.backend.enums.LeaderboardType;

import java.util.List;
import java.util.UUID;

public interface LeaderboardService {

    /**
     * Updates the score for a user in the leaderboards (all-time, weekly, and monthly).
     *
     * @param userId    the ID of the user
     * @param groupId   the ID of the group (nullable)
     * @param type      the leaderboard type
     * @param increment the amount to increment (or set, in the case of streak)
     */
    void updateScore(UUID userId, UUID groupId, LeaderboardType type, double increment);

    /**
     * Retrieves top ranking entries for a group (or "global").
     *
     * @param groupIdStr the string representing group ID or "global"
     * @param type       the leaderboard type
     * @param range      the leaderboard range
     * @param limit      maximum number of entries to return
     * @return the list of leaderboard entry DTOs
     */
    List<LeaderboardEntryResponse> getLeaderboard(String groupIdStr, LeaderboardType type, LeaderboardRange range, int limit);
}
