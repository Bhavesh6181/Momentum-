package com.momentum.backend.dto.response;

import com.momentum.backend.enums.PresenceStatus;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberPresenceResponse {
    private UUID userId;
    private String username;
    private PresenceStatus status;
    private Instant lastActive;
}
