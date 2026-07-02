package com.momentum.backend.dto.request;

import com.momentum.backend.enums.PresenceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PresenceUpdateRequest {

    @NotNull(message = "Presence status is required")
    private PresenceStatus status;
}
