package com.momentum.backend.event;

import lombok.Getter;
import java.util.UUID;

@Getter
public class GithubPushEvent {
    private final UUID userId;
    private final String repoName;
    private final String lastCommitSha;
    private final int commitCount;

    public GithubPushEvent(UUID userId, String repoName, String lastCommitSha, int commitCount) {
        this.userId = userId;
        this.repoName = repoName;
        this.lastCommitSha = lastCommitSha;
        this.commitCount = commitCount;
    }
}
