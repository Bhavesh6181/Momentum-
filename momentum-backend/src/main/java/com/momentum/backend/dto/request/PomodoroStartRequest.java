package com.momentum.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PomodoroStartRequest {

    @NotBlank(message = "Mode is required")
    private String mode; // "25_5", "50_10", "CUSTOM"

    private Integer workMinutes;

    private Integer breakMinutes;
}
