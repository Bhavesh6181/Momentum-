package com.momentum.backend.dto.request;

import com.momentum.backend.enums.GoalType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalCreateRequest {

    @NotNull(message = "Goal type is required")
    private GoalType type;

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @Positive(message = "Target value must be positive")
    private double targetValue;

    @NotBlank(message = "Unit is required")
    @Size(max = 50, message = "Unit must not exceed 50 characters")
    private String unit;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    /** Null for personal goals, set for group goals */
    private UUID groupId;
}
