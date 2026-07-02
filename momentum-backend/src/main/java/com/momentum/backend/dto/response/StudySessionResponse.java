package com.momentum.backend.dto.response;

import com.momentum.backend.enums.SessionStatus;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudySessionResponse {
    private UUID id;
    private UUID userId;
    private UUID groupId;
    private String subject;
    private String goal;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private Integer durationMinutes;
    private SessionStatus status;

    @Builder.Default
    private OffsetDateTime currentTime = OffsetDateTime.now();
}
