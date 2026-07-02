package com.momentum.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserMeResponse {
    private UUID id;
    private String username;
    private String email;
    private String role;
    private UserProfileResponse profile;
    private UserStatsResponse stats;
}
