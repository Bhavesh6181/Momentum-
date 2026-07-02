package com.momentum.backend.dto.response;

import com.momentum.backend.enums.GoalStatus;
import com.momentum.backend.enums.GoalType;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalResponse {
    private UUID id;
    private UUID userId;
    private UUID groupId;
    private GoalType type;
    private String title;
    private double targetValue;
    private double currentValue;
    private String unit;
    private GoalStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private double progressPercent;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
