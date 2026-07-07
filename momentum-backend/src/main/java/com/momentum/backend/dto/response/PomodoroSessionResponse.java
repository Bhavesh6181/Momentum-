package com.momentum.backend.dto.response;

import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PomodoroSessionResponse {
    private UUID id;
    private UUID userId;
    private String mode;
    private int workMinutes;
    private int breakMinutes;
    private OffsetDateTime startedAt;
    private OffsetDateTime completedAt;
    private int cyclesCompleted;

    @Builder.Default
    private OffsetDateTime currentTime = OffsetDateTime.now();
}
