package com.momentum.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.momentum.backend.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private UUID id;
    private UUID userId;
    private NotificationType type;
    private String message;
    private String metadata;
    @JsonProperty("isRead")
    private boolean isRead;
    private OffsetDateTime createdAt;
}
