package com.momentum.backend.repository;

import com.momentum.backend.entity.GithubSyncState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GithubSyncStateRepository extends JpaRepository<GithubSyncState, UUID> {
    Optional<GithubSyncState> findByUserIdAndRepoName(UUID userId, String repoName);
}
