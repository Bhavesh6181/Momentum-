package com.momentum.backend.controller;

import com.momentum.backend.dto.response.ApiResponse;
import com.momentum.backend.dto.response.GithubSyncResponse;
import com.momentum.backend.service.GithubService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/github")
@Slf4j
public class GithubController {

    private final GithubService githubService;

    public GithubController(GithubService githubService) {
        this.githubService = githubService;
    }

    @PostMapping("/sync/{userId}")
    public ResponseEntity<ApiResponse<GithubSyncResponse>> syncGithub(
            @PathVariable UUID userId
    ) {
        log.info("Request received to sync GitHub activity for user: {}", userId);
        GithubSyncResponse response = githubService.syncGithubActivity(userId);
        return ResponseEntity.ok(ApiResponse.success(response, "GitHub activity synced successfully"));
    }

    @GetMapping("/{userId}/activity")
    public ResponseEntity<ApiResponse<GithubSyncResponse>> getCachedActivity(
            @PathVariable UUID userId
    ) {
        log.info("Request received to get cached GitHub activity for user: {}", userId);
        GithubSyncResponse response = githubService.getCachedActivity(userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Cached GitHub activity retrieved"));
    }
}
