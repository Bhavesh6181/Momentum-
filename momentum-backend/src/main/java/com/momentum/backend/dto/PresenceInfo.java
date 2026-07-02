package com.momentum.backend.dto;

import com.momentum.backend.enums.PresenceStatus;
import lombok.*;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PresenceInfo {
    private PresenceStatus status;
    private Instant lastActive;
}
