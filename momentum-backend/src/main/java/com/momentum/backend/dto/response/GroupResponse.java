package com.momentum.backend.dto.response;

import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupResponse {
    private UUID id;
    private String name;
    private String description;
    private boolean isPrivate;
    private String inviteCode;
    private String createdBy;
    private int memberCount;
    private OffsetDateTime createdAt;
}
