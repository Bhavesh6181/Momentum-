package com.momentum.backend.dto.request;

import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalProgressRequest {

    @PositiveOrZero(message = "Progress value must be zero or positive")
    private double value;
}
