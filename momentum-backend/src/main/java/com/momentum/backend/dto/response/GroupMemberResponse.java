package com.momentum.backend.dto.response;

import com.momentum.backend.enums.GroupRole;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupMemberResponse {
    private UUID userId;
    private String username;
    private GroupRole role;
    private OffsetDateTime joinedAt;
}
