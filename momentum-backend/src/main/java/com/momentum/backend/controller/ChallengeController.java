package com.momentum.backend.controller;

import com.momentum.backend.dto.request.ChallengeCreateRequest;
import com.momentum.backend.dto.request.GoalProgressRequest;
import com.momentum.backend.dto.response.ApiResponse;
import com.momentum.backend.dto.response.ChallengeParticipantResponse;
import com.momentum.backend.dto.response.ChallengeResponse;
import com.momentum.backend.service.ChallengeService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
public class ChallengeController {

    private final ChallengeService challengeService;

    public ChallengeController(ChallengeService challengeService) {
        this.challengeService = challengeService;
    }

    /** Admin-only: create a challenge for a group */
    @PostMapping("/api/v1/groups/{groupId}/challenges")
    public ResponseEntity<ApiResponse<ChallengeResponse>> createChallenge(
            @PathVariable UUID groupId,
            @Valid @RequestBody ChallengeCreateRequest request,
            Principal principal
    ) {
        ChallengeResponse response = challengeService.createChallenge(groupId, principal.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Challenge created successfully"));
    }

    /** Any authenticated user: join a challenge (idempotent) */
    @PostMapping("/api/v1/challenges/{id}/join")
    public ResponseEntity<ApiResponse<ChallengeParticipantResponse>> joinChallenge(
            @PathVariable UUID id,
            Principal principal
    ) {
        ChallengeParticipantResponse response = challengeService.joinChallenge(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(response, "Joined challenge"));
    }

    /** Participant: update their own progress */
    @PutMapping("/api/v1/challenges/{id}/progress")
    public ResponseEntity<ApiResponse<ChallengeParticipantResponse>> updateProgress(
            @PathVariable UUID id,
            @Valid @RequestBody GoalProgressRequest request,
            Principal principal
    ) {
        ChallengeParticipantResponse response = challengeService.updateProgress(id, principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Progress updated"));
    }

    /** Any authenticated user: view leaderboard */
    @GetMapping("/api/v1/challenges/{id}/leaderboard")
    public ResponseEntity<ApiResponse<Page<ChallengeParticipantResponse>>> getLeaderboard(
            @PathVariable UUID id,
            Pageable pageable
    ) {
        Page<ChallengeParticipantResponse> board = challengeService.getLeaderboard(id, pageable);
        return ResponseEntity.ok(ApiResponse.success(board, "Leaderboard retrieved"));
    }
}
