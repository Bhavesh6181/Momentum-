package com.momentum.backend.dto.response;

import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChallengeParticipantResponse {
    private UUID userId;
    private String username;
    private double currentProgress;
    private OffsetDateTime joinedAt;
}
