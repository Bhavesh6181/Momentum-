package com.momentum.backend.service;

import com.momentum.backend.dto.request.ChallengeCreateRequest;
import com.momentum.backend.dto.request.GoalProgressRequest;
import com.momentum.backend.dto.response.ChallengeParticipantResponse;
import com.momentum.backend.dto.response.ChallengeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ChallengeService {
    ChallengeResponse createChallenge(UUID groupId, String username, ChallengeCreateRequest request);
    ChallengeParticipantResponse joinChallenge(UUID challengeId, String username);
    ChallengeParticipantResponse updateProgress(UUID challengeId, String username, GoalProgressRequest request);
    Page<ChallengeParticipantResponse> getLeaderboard(UUID challengeId, Pageable pageable);
}
