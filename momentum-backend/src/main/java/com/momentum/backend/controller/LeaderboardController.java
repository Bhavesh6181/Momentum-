package com.momentum.backend.controller;

import com.momentum.backend.dto.response.LeaderboardEntryResponse;
import com.momentum.backend.service.LeaderboardService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/groups")
@Slf4j
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping("/{groupId}/leaderboard")
    public ResponseEntity<List<LeaderboardEntryResponse>> getLeaderboard(
            @PathVariable String groupId,
            @RequestParam String type,
            @RequestParam(defaultValue = "all-time") String range,
            @RequestParam(defaultValue = "10") int limit
    ) {
        log.info("Leaderboard request received: group={}, type={}, range={}, limit={}", groupId, type, range, limit);
        List<LeaderboardEntryResponse> entries = leaderboardService.getLeaderboard(groupId, type, range, limit);
        return ResponseEntity.ok(entries);
    }
}
