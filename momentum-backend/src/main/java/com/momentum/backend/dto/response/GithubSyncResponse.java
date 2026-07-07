package com.momentum.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GithubSyncResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private String githubUsername;
    private int repoCount;
    private int contributionCount;
    private List<RepoActivity> recentRepositories;
    private OffsetDateTime syncedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RepoActivity implements Serializable {
        private static final long serialVersionUID = 1L;
        
        private String repoName;
        private String lastCommitSha;
        private String lastCommitMessage;
        private int newCommitsCount;
    }
}
