package com.momentum.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfilePublicResponse {
    private String username;
    private UserProfileResponse profile;
    private UserStatsResponse stats;
}
