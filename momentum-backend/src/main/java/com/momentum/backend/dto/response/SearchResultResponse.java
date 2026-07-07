package com.momentum.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResultResponse {
    private List<GroupSearchDto> groups;
    private List<UserSearchDto> users;
    private List<ActivitySearchDto> activities;
    private List<ChallengeSearchDto> challenges;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GroupSearchDto {
        private UUID id;
        private String name;
        private String description;
        private boolean isPrivate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserSearchDto {
        private UUID id;
        private String username;
        private String name;
        private String profilePictureUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ActivitySearchDto {
        private UUID id;
        private String description;
        private String type;
        private OffsetDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChallengeSearchDto {
        private UUID id;
        private String title;
        private String description;
        private String status;
    }
}
