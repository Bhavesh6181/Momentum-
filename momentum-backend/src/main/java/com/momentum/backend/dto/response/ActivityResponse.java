package com.momentum.backend.dto.response;

import com.momentum.backend.enums.ActivityType;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityResponse {
    private UUID id;
    private UUID userId;
    private String username;
    private UUID groupId;
    private ActivityType type;
    private String description;
    private String metadata;
    private OffsetDateTime createdAt;
}
