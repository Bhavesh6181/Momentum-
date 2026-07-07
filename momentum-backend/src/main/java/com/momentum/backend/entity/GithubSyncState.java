package com.momentum.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "github_sync_states",
    indexes = {
        @Index(name = "idx_git_sync_user_id", columnList = "user_id"),
        @Index(name = "idx_git_sync_user_repo", columnList = "user_id, repo_name", unique = true)
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GithubSyncState {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "repo_name", nullable = false)
    private String repoName;

    @Column(name = "last_commit_sha", nullable = false)
    private String lastCommitSha;

    @Column(name = "last_synced_at", nullable = false)
    private OffsetDateTime lastSyncedAt;
}
