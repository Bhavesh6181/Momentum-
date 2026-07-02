package com.momentum.backend.dto.response;

import com.momentum.backend.enums.ChallengeStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChallengeResponse {
    private UUID id;
    private UUID groupId;
    private UUID createdById;
    private String title;
    private String description;
    private double targetValue;
    private String unit;
    private LocalDate startDate;
    private LocalDate endDate;
    private ChallengeStatus status;
    private OffsetDateTime createdAt;
}
